"""
Views for Accessibility Checker.

Exposes the POST /api/check-accessibility/ endpoint.
"""

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .accessibility_checker import check_accessibility, calculate_accessibility_score
from .accessibility_serializers import (
    AccessibilityCheckRequestSerializer,
    AccessibilityReportResponseSerializer,
)


class AccessibilityCheckView(APIView):
    """
    API View to handle resume accessibility checking requests.
    """

    def post(self, request, *args, **kwargs):
        """
        Process resume text and return an accessibility compliance report.
        """
        request_serializer = AccessibilityCheckRequestSerializer(data=request.data)
        if not request_serializer.is_valid():
            return Response(
                {"errors": request_serializer.errors},
                status=status.HTTP_400_BAD_REQUEST,
            )

        resume_text = request_serializer.validated_data["resume_text"]

        try:
            findings = check_accessibility(resume_text)
            score = calculate_accessibility_score(findings)

            response_data = {
                "findings": findings,
                "accessibility_score": score,
                "total_issues": len(findings),
            }

            response_serializer = AccessibilityReportResponseSerializer(
                data=response_data
            )
            response_serializer.is_valid(raise_exception=True)

            return Response(response_serializer.data, status=status.HTTP_200_OK)

        except Exception as e:
            return Response(
                {
                    "error": "An unexpected error occurred during accessibility check.",
                    "details": str(e),
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
