from django.db import models
from django.contrib.auth.models import BaseUserManager,AbstractBaseUser,PermissionsMixin

# Create your models here.
class MyAccountManager(BaseUserManager):

    def create_user(self,username,email,password=None,**extra_fields):

        if not email:
            raise ValueError("User must have an valid address")
        if not username:
            raise ValueError("User must have an username")
        
        user = self.model(
            email = self.normalize_email(email),
            username = username,
            **extra_fields,
        )
        user.set_password(password)
        user.save(using = self._db)
        return user
    
    def create_superuser(self,username,email,password=None,**extra_fields):

        user = self.create_user(username,email,password=password,**extra_fields)
        user.is_active = True
        user.is_staff = True
        user.is_superuser = True

        user.save(using = self._db)
        return user
    
class Account(AbstractBaseUser,PermissionsMixin):

    username = models.CharField(max_length=50,unique=True)
    email = models.EmailField(max_length=254,unique=True)

    first_name = models.CharField(max_length=50)
    last_name = models.CharField(max_length=50)
    phone = models.CharField(max_length=50)
    profile_picture = models.ImageField(upload_to='Profile/',blank=True)

    is_active = models.BooleanField(default=True)   # True = only for oauth authentication
    is_staff = models.BooleanField(default=False)
    
    date_joined = models.DateTimeField(auto_now_add=True)
    
    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["username","first_name","last_name"]
    
    objects = MyAccountManager()

    def __str__(self):
        return self.email
    
    def get_full_name(self):
        return f"{self.first_name} {self.last_name}"
    
    def get_short_name(self):
        return self.username