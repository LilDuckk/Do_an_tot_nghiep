from django.db import models
from apps.users.models import UserAccount

class Customer(models.Model):
    GENDER_CHOICES = (
        ('male', 'Male'),
        ('female', 'Female'),
        ('other', 'Other'),
    )

    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email = models.EmailField(max_length=255, blank=True, null=True)
    phone = models.CharField(max_length=20, blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    birth_date = models.DateField(blank=True, null=True)
    gender = models.CharField(max_length=10, choices=GENDER_CHOICES, blank=True, null=True)
    notes = models.TextField(blank=True, null=True)
    is_deleted = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    created_by = models.ForeignKey(UserAccount, on_delete=models.DO_NOTHING, related_name='customers_created', null=True, blank=True)
    updated_by = models.ForeignKey(UserAccount, on_delete=models.DO_NOTHING, related_name='customers_updated', null=True, blank=True)

    def __str__(self):
        return f"{self.first_name} {self.last_name}"
