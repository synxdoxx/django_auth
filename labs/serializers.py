from rest_framework import serializers
from .models import Lab, Submission, Event


class LabSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lab
        fields = ("id", "title", "free_slots")


class SubmissionSerializer(serializers.ModelSerializer):
    lab_title = serializers.CharField(source="lab.title", read_only=True)

    class Meta:
        model = Submission
        fields = ("id", "lab", "lab_title", "comment", "status", "created_at")
        read_only_fields = ("status", "created_at")


class EventSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField()

    class Meta:
        model = Event
        fields = ("id", "action", "user", "created_at")