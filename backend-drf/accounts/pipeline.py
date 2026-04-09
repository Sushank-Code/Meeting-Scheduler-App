def save_extra_fields(backend, user, response, *args, **kwargs):
    if backend.name == 'google-oauth2':
        user.provider = 'google'
        user.provider_id = response.get("sub")
        user.profile_picture = response.get("picture")
        user.save()
        return {'user': user}