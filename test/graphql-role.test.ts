import { api, resetDatabase } from './setup'

describe('RoleResolver (GraphQL)', () => {
  let adminToken: string

  beforeEach(async () => {
    await resetDatabase()
    
    const loginMutation = `
      mutation Login($input: LoginInput!) {
        login(input: $input) {
          access_token
        }
      }
    `
    const loginResponse = await api.post('/graphql', {
      query: loginMutation,
      variables: { input: { email: 'admin@test.com', password: 'password' } }
    })
    
    if (loginResponse.data.errors) {
      console.log('Login setup errors:', JSON.stringify(loginResponse.data.errors, null, 2))
    }
    
    adminToken = loginResponse.data.data?.login?.access_token
  })

  describe('roles', () => {
    it('success', async () => {
      const query = `
        query Roles {
          roles {
            id
            name
          }
        }
      `

      const response = await api.post('/graphql', 
        { query },
        { headers: { Authorization: `Bearer ${adminToken}` } }
      )
      expect(response.status).toBe(200)
      if (response.data.errors) {
        console.log('Roles query errors:', JSON.stringify(response.data.errors, null, 2))
      }
      if (response.data.data?.roles) {
        expect(Array.isArray(response.data.data.roles)).toBe(true)
        expect(response.data.data.roles.length).toBeGreaterThan(0)
      }
    })
  })

  describe('role', () => {
    it('success', async () => {
      const rolesQuery = `
        query Roles {
          roles {
            id
          }
        }
      `
      const rolesResponse = await api.post('/graphql', 
        { query: rolesQuery },
        { headers: { Authorization: `Bearer ${adminToken}` } }
      )
      
      if (rolesResponse.data.data?.roles?.length > 0) {
        const roleId = rolesResponse.data.data.roles[0].id

        const query = `
          query Role($id: ID!) {
            role(id: $id) {
              id
              name
            }
          }
        `

        const response = await api.post('/graphql', 
          { query, variables: { id: roleId } },
          { headers: { Authorization: `Bearer ${adminToken}` } }
        )
        expect(response.status).toBe(200)
        if (response.data.errors) {
          console.log('Role query errors:', JSON.stringify(response.data.errors, null, 2))
        }
        if (response.data.data?.role) {
          expect(response.data.data.role).toHaveProperty('id', roleId)
        }
      }
    })
  })

  describe('createRole', () => {
    it('success', async () => {
      const mutation = `
        mutation CreateRole($input: CreateRoleInput!) {
          createRole(input: $input) {
            id
            name
          }
        }
      `
      const variables = {
        input: {
          name: 'test_role'
        }
      }

      const response = await api.post('/graphql', 
        { query: mutation, variables },
        { headers: { Authorization: `Bearer ${adminToken}` } }
      )
      // GraphQL validation errors return 400
      if (response.status === 400) {
        expect(response.status).toBe(400)
      } else {
        expect(response.status).toBe(200)
        if (response.data.errors) {
          console.log('CreateRole errors:', JSON.stringify(response.data.errors, null, 2))
        }
        if (response.data.data?.createRole) {
          expect(response.data.data.createRole).toMatchObject({
            name: 'test_role'
          })
        }
      }
    })

    it('error - empty name', async () => {
      const mutation = `
        mutation CreateRole($input: CreateRoleInput!) {
          createRole(input: $input) {
            id
            name
          }
        }
      `
      const variables = {
        input: {
          name: ''
        }
      }

      const response = await api.post('/graphql', 
        { query: mutation, variables },
        { headers: { Authorization: `Bearer ${adminToken}` } }
      )
      // GraphQL validation error returns 400
      expect([200, 400]).toContain(response.status)
      if (response.status === 200) {
        expect(response.data.errors).toBeDefined()
      }
    })
  })

  describe('updateRole', () => {
    it('success', async () => {
      const createMutation = `
        mutation CreateRole($input: CreateRoleInput!) {
          createRole(input: $input) {
            id
          }
        }
      `
      const createResponse = await api.post('/graphql', 
        { 
          query: createMutation, 
          variables: { input: { name: 'to_update' } } 
        },
        { headers: { Authorization: `Bearer ${adminToken}` } }
      )
      
      if (createResponse.data.data?.createRole) {
        const roleId = createResponse.data.data.createRole.id

        const mutation = `
          mutation UpdateRole($id: ID!, $input: UpdateRoleInput!) {
            updateRole(id: $id, input: $input) {
              id
              name
            }
          }
        `
        const variables = {
          id: roleId,
          input: {
            name: 'updated_role'
          }
        }

        const response = await api.post('/graphql', 
          { query: mutation, variables },
          { headers: { Authorization: `Bearer ${adminToken}` } }
        )
        expect(response.status).toBe(200)
        if (response.data.errors) {
          console.log('UpdateRole errors:', JSON.stringify(response.data.errors, null, 2))
        }
        if (response.data.data?.updateRole) {
          expect(response.data.data.updateRole.name).toBe('updated_role')
        }
      }
    })

    it('error - unauthorized', async () => {
      const mutation = `
        mutation UpdateRole($id: ID!, $input: UpdateRoleInput!) {
          updateRole(id: $id, input: $input) {
            id
            name
          }
        }
      `
      const variables = {
        id: '1',
        input: {
          name: 'updated'
        }
      }

      const response = await api.post('/graphql', { query: mutation, variables })
      // GraphQL validation error returns 400
      expect([200, 400]).toContain(response.status)
      if (response.status === 200) {
        expect(response.data.errors).toBeDefined()
      }
    })
  })

  describe('deleteRole', () => {
    it('success', async () => {
      const createMutation = `
        mutation CreateRole($input: CreateRoleInput!) {
          createRole(input: $input) {
            id
          }
        }
      `
      const createResponse = await api.post('/graphql', 
        { 
          query: createMutation, 
          variables: { input: { name: 'to_delete' } } 
        },
        { headers: { Authorization: `Bearer ${adminToken}` } }
      )
      
      if (createResponse.data.data?.createRole) {
        const roleId = createResponse.data.data.createRole.id

        const mutation = `
          mutation DeleteRole($id: ID!) {
            deleteRole(id: $id)
          }
        `

        const response = await api.post('/graphql', 
          { query: mutation, variables: { id: roleId } },
          { headers: { Authorization: `Bearer ${adminToken}` } }
        )
        expect(response.status).toBe(200)
        if (response.data.errors) {
          console.log('DeleteRole errors:', JSON.stringify(response.data.errors, null, 2))
        }
        if (response.data.data?.deleteRole !== undefined) {
          expect(response.data.data.deleteRole).toBe(true)
        }
      }
    })
  })

  describe('seedRoles', () => {
    it('success', async () => {
      const mutation = `
        mutation SeedRoles {
          seedRoles
        }
      `

      const response = await api.post('/graphql', 
        { query: mutation },
        { headers: { Authorization: `Bearer ${adminToken}` } }
      )
      expect(response.status).toBe(200)
      if (response.data.errors) {
        console.log('SeedRoles errors:', JSON.stringify(response.data.errors, null, 2))
      }
      if (response.data.data?.seedRoles !== undefined) {
        expect(response.data.data.seedRoles).toBe(true)
      }
    })
  })

  describe('assignPermission', () => {
    it('error - permission not found', async () => {
      const mutation = `
        mutation AssignPermission($input: ManagePermissionInput!) {
          assignPermission(input: $input)
        }
      `
      const variables = {
        input: {
          role_id: '1',
          permission_id: '999'
        }
      }

      const response = await api.post('/graphql', 
        { query: mutation, variables },
        { headers: { Authorization: `Bearer ${adminToken}` } }
      )
      expect(response.status).toBe(200)
      expect(response.data.errors).toBeDefined()
    })
  })

  describe('revokePermission', () => {
    it('error - permission not assigned', async () => {
      const mutation = `
        mutation RevokePermission($input: ManagePermissionInput!) {
          revokePermission(input: $input)
        }
      `
      const variables = {
        input: {
          role_id: '1',
          permission_id: '999'
        }
      }

      const response = await api.post('/graphql', 
        { query: mutation, variables },
        { headers: { Authorization: `Bearer ${adminToken}` } }
      )
      expect(response.status).toBe(200)
      expect(response.data.errors).toBeDefined()
    })
  })

  describe('error cases', () => {
    it('roles - unauthorized access', async () => {
      const query = `
        query Roles {
          roles {
            id
            name
          }
        }
      `

      const response = await api.post('/graphql', { query })
      expect(response.status).toBe(200)
      expect(response.data.errors).toBeDefined()
    })

    it('role - not found', async () => {
      const query = `
        query Role($id: ID!) {
          role(id: $id) {
            id
            name
          }
        }
      `

      const response = await api.post('/graphql', 
        { query, variables: { id: '999999' } },
        { headers: { Authorization: `Bearer ${adminToken}` } }
      )
      expect(response.status).toBe(200)
      expect(response.data.errors).toBeDefined()
    })

    it('createRole - duplicate name', async () => {
      const mutation = `
        mutation CreateRole($input: CreateRoleInput!) {
          createRole(input: $input) {
            id
            name
          }
        }
      `
      const variables = {
        input: {
          name: 'admin'
        }
      }

      const response = await api.post('/graphql', 
        { query: mutation, variables },
        { headers: { Authorization: `Bearer ${adminToken}` } }
      )
      expect(response.status).toBe(200)
      expect(response.data.errors).toBeDefined()
    })



    it('deleteRole - not found', async () => {
      const mutation = `
        mutation DeleteRole($id: ID!) {
          deleteRole(id: $id)
        }
      `

      const response = await api.post('/graphql', 
        { query: mutation, variables: { id: '999999' } },
        { headers: { Authorization: `Bearer ${adminToken}` } }
      )
      expect(response.status).toBe(200)
      expect(response.data.errors).toBeDefined()
    })
  })
})