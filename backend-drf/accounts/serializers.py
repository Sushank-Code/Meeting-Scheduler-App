from rest_framework import serializers
from accounts.models import Account

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = Account
        fields = ['id', 'email', 'username','first_name','last_name','profile_picture']

class UserDeleteSerializer(serializers.Serializer):
    # Google-auth users have no usable password, so account
    # deletion cannot ask for current_password confirmation.
    pass