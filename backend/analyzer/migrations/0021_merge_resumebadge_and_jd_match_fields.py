"""Rejoin the migration graph after two 0020 leaves were merged in parallel.

``0020_resumebadge`` (the score badge, #611) and ``0020_merge_20260824_0025``
(the JD match fields) were both written against ``0019_batchupload`` and merged
within a day of each other. Neither is aware of the other, so the analyzer app
ended up with two leaf nodes.

Django refuses to build a migration plan at all in that state, which meant
``manage.py migrate``, ``manage.py test`` and every ``manage.py`` command that
touches the loader failed on ``main`` with:

    CommandError: Conflicting migrations detected; multiple leaf nodes in the
    migration graph: (0020_merge_20260824_0025, 0020_resumebadge in analyzer).

This migration has no operations. Its only job is to depend on both leaves so
there is a single tip again. It is what ``makemigrations --merge`` generates.
"""

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ("analyzer", "0020_merge_20260824_0025"),
        ("analyzer", "0020_resumebadge"),
    ]

    operations = []
