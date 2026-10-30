from django.conf import settings
from django.db import models


class Lab(models.Model):
    title = models.CharField(max_length=200)
    free_slots = models.PositiveIntegerField(default=5)

    def __str__(self):
        return self.title


class Submission(models.Model):
    class Status(models.TextChoices):
        NEW = "new", "Сдана"
        BOOKED = "booked", "Записана на защиту"
        ACCEPTED = "accepted", "Принята"

    lab = models.ForeignKey(Lab, on_delete=models.PROTECT, related_name="submissions")
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="submissions")
    comment = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.NEW)
    created_at = models.DateTimeField(auto_now_add=True)


class Event(models.Model):
    submission = models.ForeignKey(Submission, on_delete=models.CASCADE, related_name="events")
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    action = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]