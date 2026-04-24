from rest_framework import serializers
from accounts.models import Account

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = Account
        fields = ['id', 'email', 'username','first_name','last_name','profile_picture']    