from django.contrib.auth.decorators import login_required
from django.db import transaction
from django.shortcuts import render
from django.views.decorators.csrf import ensure_csrf_cookie
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.response import Response

from .models import Lab, Submission, Event
from .serializers import LabSerializer, SubmissionSerializer, EventSerializer


@login_required(login_url="/admin/login/")
@ensure_csrf_cookie
def page(request):
    return render(request, "labs/index.html")


class LabViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Lab.objects.all()
    serializer_class = LabSerializer


class SubmissionViewSet(viewsets.ModelViewSet):
    serializer_class = SubmissionSerializer

    def get_queryset(self):
        qs = Submission.objects.select_related("lab")
        if not self.request.user.is_staff:
            qs = qs.filter(owner=self.request.user)
        status = self.request.query_params.get("status")
        lab = self.request.query_params.get("lab")
        if status:
            qs = qs.filter(status=status)
        if lab:
            qs = qs.filter(lab_id=lab)
        return qs.order_by("-created_at")

    def perform_create(self, serializer):
        with transaction.atomic():
            sub = serializer.save(owner=self.request.user)
            Event.objects.create(submission=sub, user=self.request.user, action="Работа сдана")

    def perform_update(self, serializer):
        if serializer.instance.status != Submission.Status.NEW:
            raise ValidationError({"detail": "Менять можно только работу в статусе «Сдана»."})
        serializer.save()

    def perform_destroy(self, instance):
        if instance.status != Submission.Status.NEW:
            raise ValidationError({"detail": "Удалять можно только работу в статусе «Сдана»."})
        instance.delete()

    @action(detail=True, methods=["post"])
    def book(self, request, pk=None):
        sub = self.get_object()
        if sub.status != Submission.Status.NEW:
            raise ValidationError({"detail": "Записаться можно только из статуса «Сдана»."})
        if sub.lab.free_slots < 1:
            raise ValidationError({"detail": "Свободных мест на защиту нет."})

        with transaction.atomic():
            sub.lab.free_slots -= 1
            sub.lab.save()
            sub.status = Submission.Status.BOOKED
            sub.save()
            Event.objects.create(submission=sub, user=request.user, action="Запись на защиту")
        return Response(SubmissionSerializer(sub).data)

    @action(detail=True, methods=["post"])
    def accept(self, request, pk=None):
        if not request.user.is_staff:
            raise PermissionDenied("Принимать работы может только преподаватель.")
        sub = self.get_object()
        if sub.status != Submission.Status.BOOKED:
            raise ValidationError({"detail": "Принять можно только работу в статусе «Записана»."})

        with transaction.atomic():
            sub.status = Submission.Status.ACCEPTED
            sub.save()
            Event.objects.create(submission=sub, user=request.user, action="Работа принята")
        return Response(SubmissionSerializer(sub).data)

    @action(detail=True, methods=["get"])
    def history(self, request, pk=None):
        sub = self.get_object()
        return Response(EventSerializer(sub.events.all(), many=True).data)