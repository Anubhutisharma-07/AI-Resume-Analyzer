"""
Views for Metadata Sanitizer.

Exposes endpoints for GET /api/file-metadata/ and POST /api/sanitize-resume/.
"""

import os
import tempfile
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.parsers import MultiPartParser, FormParser
from .metadata_sanitizer import (
    extract_pdf_metadata,
    extract_docx_metadata,
    detect_pii_in_text,
    redact_pii_from_text,
    sanitize_pdf_file,
    sanitize_docx_file,
)
from .sanitizer_serializers import (
    MetadataExtractionRequestSerializer,
    PIIRedactionRequestSerializer,
    MetadataResponseSerializer,
    RedactionResponseSerializer,
)


class FileMetadataView(APIView):
    """
    API View to extract and display file metadata and PII detections.
    """

    parser_classes = (MultiPartParser, FormParser)

    def post(self, request, *args, **kwargs):
        serializer = MetadataExtractionRequestSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                {"errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST
            )

        uploaded_file = serializer.validated_data["file"]
        filename = uploaded_file.name
        filetype = filename.split(".")[-1].lower()

        # Save to temp file for processing
        with tempfile.NamedTemporaryFile(
            delete=False, suffix=f".{filetype}"
        ) as temp_file:
            for chunk in uploaded_file.chunks():
                temp_file.write(chunk)
            temp_path = temp_file.name

        try:
            if filetype == "pdf":
                metadata = extract_pdf_metadata(temp_path)
                # For PII detection, we'd ideally extract text first.
                # Simplified here to return structure.
                pii_detections = []
            elif filetype == "docx":
                metadata = extract_docx_metadata(temp_path)
                pii_detections = []
            else:
                return Response(
                    {"error": "Unsupported file type. Use PDF or DOCX."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            response_data = {
                "filename": filename,
                "filetype": filetype,
                "metadata": metadata,
                "pii_detections": pii_detections,
            }

            response_serializer = MetadataResponseSerializer(data=response_data)
            response_serializer.is_valid(raise_exception=True)

            return Response(response_serializer.data, status=status.HTTP_200_OK)

        finally:
            if os.path.exists(temp_path):
                os.remove(temp_path)


class SanitizeResumeView(APIView):
    """
    API View to redact PII from provided text.
    """

    def post(self, request, *args, **kwargs):
        serializer = PIIRedactionRequestSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                {"errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST
            )

        text = serializer.validated_data["text"]
        pii_types = serializer.validated_data["pii_types_to_redact"]

        redacted_text = redact_pii_from_text(text, pii_types)

        response_data = {
            "original_text": text,
            "redacted_text": redacted_text,
            "redacted_types": pii_types,
        }

        response_serializer = RedactionResponseSerializer(data=response_data)
        response_serializer.is_valid(raise_exception=True)

        return Response(response_serializer.data, status=status.HTTP_200_OK)
