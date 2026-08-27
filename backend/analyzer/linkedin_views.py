"""
Views for LinkedIn Profile Optimization.

Exposes the POST /api/optimize-linkedin/ endpoint.
"""

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .linkedin_optimizer import generate_linkedin_profile
from .linkedin_serializers import (
    LinkedInOptimizationRequestSerializer,
    LinkedInOptimizationResponseSerializer,
)


class LinkedInOptimizationView(APIView):
    """
    API View to handle LinkedIn profile optimization requests.
    """

    def post(self, request, *args, **kwargs):
        """
        Process resume data and return optimized LinkedIn profile sections.
        """
        # Validate incoming data
        request_serializer = LinkedInOptimizationRequestSerializer(data=request.data)
        if not request_serializer.is_valid():
            return Response(
                {"errors": request_serializer.errors},
                status=status.HTTP_400_BAD_REQUEST,
            )

        validated_data = request_serializer.validated_data

        try:
            # Generate optimized profile
            optimized_profile = generate_linkedin_profile(validated_data)

            # Serialize and return response
            response_serializer = LinkedInOptimizationResponseSerializer(
                data=optimized_profile
            )
            response_serializer.is_valid(raise_exception=True)

            return Response(response_serializer.data, status=status.HTTP_200_OK)

        except Exception as e:
            return Response(
                {
                    "error": "An unexpected error occurred during optimization.",
                    "details": str(e),
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
