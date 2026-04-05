from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from accounts.models import Account

# Register your models here.
@admin.register(Account)
class AccountAdmin(UserAdmin):
    model = Account
    list_display = ['id','email','username','profile_picture','is_active','is_staff','is_superuser','date_joined','last_login']
    list_display_links = ['email']

    readonly_fields = ['password','date_joined','last_login']
    ordering = ['email','id']
    list_filter = ['groups']

    fieldsets = [
        ("User Credentials",{"fields" : ["username","email","password"]}),
        ("Personal Information",{"fields" : ["first_name","last_name","phone","profile_picture"]}),
        ("Permissions",{"fields" : ["is_active","is_staff","is_superuser","groups","user_permissions"]}),
        ("Imp Date",{"fields" : ["last_login","date_joined"]}),
    ]
    filter_horizontal = []