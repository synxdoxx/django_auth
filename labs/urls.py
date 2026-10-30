from django.urls import include, path
from rest_framework.routers import DefaultRouter
from .views import LabViewSet, SubmissionViewSet, page

router = DefaultRouter()
router.register("labs", LabViewSet, basename="labs")
router.register("submissions", SubmissionViewSet, basename="submissions")

urlpatterns = [
    path("labs/", page, name="labs_page"),
    path("api/", include(router.urls)),
]