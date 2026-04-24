const createStoreFieldKeyMap: Record<string, string> = {
    // User fields
    'user.name': 'first_name', // maps to combined `first_name + last_name`
    'user.email': 'email',
    'user.mobile': 'mobile',
    'user.password': 'password',
    'user.confirm_password': 'confirm_password',

    // Store fields
    'store.name': 'store_name',
    'store.description': 'store_description',
    'store.tax_id': 'tax_id',
    'store.business_license': 'business_license',

    // Documents
    'store.documents': 'documents',

    // Address fields
    'store.address.country': 'country',
    'store.address.countryId': 'country',
    'store.address.state': 'state',
    'store.address.stateId': 'state',
    'store.address.city': 'city',
    'store.address.cityId': 'city',
    'store.address.address_line1': 'address',
    'store.address.address_line2': 'address',
    'store.address.latitude': 'city',
    'store.address.longitude': 'city',

    // Optional extra if zip/postal is added
    'store.address.zip': 'zip',
};

export default createStoreFieldKeyMap;