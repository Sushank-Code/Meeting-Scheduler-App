from django.test import TestCase
from accounts.models import Account

class AccountModelTest(TestCase):
    def test_create_user(self):
        username = 'Test_User'
        email = 'testuser@gmail.com'
        first_name = 'Test_first'
        last_name = 'Test_last'

        acc = Account.objects.create_user(username = username , email = email , first_name = first_name ,last_name = last_name)

        self.assertEqual(acc.username , username)
        self.assertEqual(acc.email , email)
        self.assertEqual(acc.first_name , first_name)
        self.assertEqual(acc.last_name , last_name)

        self.assertTrue(acc.is_active)
        self.assertFalse(acc.is_staff)
        self.assertFalse(acc.is_superuser)


    def test_create_superuser(self):
        username = 'Test_SuperUser'
        email = 'testsuperuser@gmail.com'
        first_name = 'Test_sfirst'
        last_name = 'Test_sLast'
        password = 'admin*123'

        superacc = Account.objects.create_superuser(username = username , email = email , first_name = first_name ,last_name = last_name,password = password)

        self.assertEqual(superacc.username , username)
        self.assertEqual(superacc.email , email)
        self.assertEqual(superacc.first_name , first_name)
        self.assertEqual(superacc.last_name , last_name)

        self.assertTrue(superacc.is_active)
        self.assertTrue(superacc.is_staff)
        self.assertTrue(superacc.is_superuser)
        self.assertTrue(superacc.check_password(password))

class AccountMethodTest(TestCase):

    def test_get_full_name(self):
        acc = Account(first_name = 'Test', last_name = 'User')
        self.assertEqual(acc.get_full_name(),'Test User') 
