const BASE_URL = 'http://localhost:1337'; // Replace with your Strapi URL
const ADMIN_EMAIL = 'suraj.sharma@vocso.com'; // Replace with your admin email
const ADMIN_PASSWORD = 'Suraj@123#';
const ROLE_NAMES = ['ADMIN', 'MANAGER', 'HR', 'EMPLOYEE']; // Roles to be created


// Helper function for making API requests
const fetchApi = async (url, options = {}) => {
    try {
        const response = await fetch(url, options);
        if (!response.ok) {
            const errorData = await response.json();
            console.log(errorData)
            throw new Error(`${response.status}: ${errorData.message || response.statusText}`);
        }
        return response.json();
    } catch (error) {
        console.error(`Error during API call to ${url}:`, error);
        process.exit(1);
    }
};

// Authenticate with the Strapi admin
const authenticate = async () => {
    const response = await fetchApi(`${BASE_URL}/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
    });
    return response.data.token; // Return the JWT token
};

// Create a new role
const createRole = async (token, roleName) => {
    // Check if the role already exists
    const rolesResponse = await fetchApi(`${BASE_URL}/users-permissions/roles`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
    });

    const existingRole = rolesResponse.roles.find((role) => role.name === roleName);

    if (existingRole) {
        console.log(`Role "${roleName}" already exists.`);
        return existingRole.id;
    }

    // Create the role
    const roleResponse = await fetchApi(`${BASE_URL}/users-permissions/roles`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
            name: roleName,
            description: `A custom ${roleName} role with all permissions`,
        }),
    });
    console.log(`Role "${roleName}" created successfully.`, roleResponse);
};

// Enable all permissions
function enableAllPermissions(permissions) {
    function traverse(obj) {
        for (const key in obj) {
            if (typeof obj[key] === 'object' && obj[key] !== null) {
                traverse(obj[key]);
            } else if (key === 'enabled') {
                obj[key] = true;
            }
        }
    }

    const updatedPermissions = JSON.parse(JSON.stringify(permissions));
    traverse(updatedPermissions);
    return updatedPermissions;
}

// Assign permissions to the role
const assignPermissions = async (token, roleName) => {
    const permissionsResponse = await fetchApi(`${BASE_URL}/users-permissions/permissions`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
    });

    const perm = enableAllPermissions(permissionsResponse);

    const rolesResponse = await fetchApi(`${BASE_URL}/users-permissions/roles`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
    });

    const existingRole = rolesResponse.roles.find((role) => role.name === roleName);
    console.log(existingRole);

    await fetchApi(`${BASE_URL}/users-permissions/roles/${existingRole.id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(perm),
    });

    console.log(`All permissions assigned to role "${roleName}".`);
};

// Main function to orchestrate the operations
const main = async () => {
    const token = await authenticate();
    const rolesResponse = await fetchApi(`${BASE_URL}/users-permissions/roles`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
    });
    const extraRole = rolesResponse.roles.filter((role) => !ROLE_NAMES.includes(role.name));
    for (let role of extraRole) {
        if (role.name === 'Public')
            continue;
        await fetchApi(`${BASE_URL}/users-permissions/roles/${role.id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` },
        });
    }

    for (let roleName of ROLE_NAMES) {
        await createRole(token, roleName);  // Create each role
        await assignPermissions(token, roleName); // Assign permissions to each role
    }
};

main();
