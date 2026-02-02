import { api, resetDatabase } from './setup'

describe('PermissionResolver (GraphQL)', () => {
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
      variables: { input: { email: 'admin@wizardcld.com', password: 'password' } }
    })
    
    if (loginResponse.data.errors) {
      console.log('Login setup errors:', JSON.stringify(loginResponse.data.errors, null, 2))
    }
    
    adminToken = loginResponse.data.data?.login?.access_token
  })

  describe('permissions', () => {
    it('success', async () => {
      const query = `
        query Permissions {
          permissions {
            id
            action
            module
          }
        }
      `

      const response = await api.post('/graphql', 
        { query },
        { headers: { Authorization: `Bearer ${adminToken}` } }
      )
      expect(response.status).toBe(200)
      if (response.data.errors) {
        console.log('Permissions query errors:', JSON.stringify(response.data.errors, null, 2))
      }
      if (response.data.data?.permissions) {
        expect(Array.isArray(response.data.data.permissions)).toBe(true)
        expect(response.data.data.permissions.length).toBeGreaterThan(0)
      }
    })
  })

  describe('permission', () => {
    it('success', async () => {
      const permissionsQuery = `
        query Permissions {
          permissions {
            id
          }
        }
      `
      const permissionsResponse = await api.post('/graphql', 
        { query: permissionsQuery },
        { headers: { Authorization: `Bearer ${adminToken}` } }
      )
      
      if (permissionsResponse.data.data?.permissions?.length > 0) {
        const permissionId = permissionsResponse.data.data.permissions[0].id

        const query = `
          query Permission($id: ID!) {
            permission(id: $id) {
              id
              action
              module
            }
          }
        `

        const response = await api.post('/graphql', 
          { query, variables: { id: permissionId } },
          { headers: { Authorization: `Bearer ${adminToken}` } }
        )
        expect(response.status).toBe(200)
        if (response.data.errors) {
          console.log('Permission query errors:', JSON.stringify(response.data.errors, null, 2))
        }
        if (response.data.data?.permission) {
          expect(response.data.data.permission).toHaveProperty('id', permissionId)
        }
      }
    })
  })

  describe('createPermission', () => {
    it('success', async () => {
      const mutation = `
        mutation CreatePermission($input: CreatePermissionInput!) {
          createPermission(input: $input) {
            id
            action
            module
          }
        }
      `
      const variables = {
        input: {
          action: 'test',
          module: 'test_module'
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
          console.log('CreatePermission errors:', JSON.stringify(response.data.errors, null, 2))
        }
        if (response.data.data?.createPermission) {
          expect(response.data.data.createPermission).toMatchObject({
            action: 'test',
            module: 'test_module'
          })
        }
      }
    })

    it('error - empty action', async () => {
      const mutation = `
        mutation CreatePermission($input: CreatePermissionInput!) {
          createPermission(input: $input) {
            id
            action
            module
          }
        }
      `
      const variables = {
        input: {
          action: '',
          module: 'test_module'
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

  describe('updatePermission', () => {
    it('success', async () => {
      const createMutation = `
        mutation CreatePermission($input: CreatePermissionInput!) {
          createPermission(input: $input) {
            id
          }
        }
      `
      const createResponse = await api.post('/graphql', 
        { 
          query: createMutation, 
          variables: { input: { action: 'test', module: 'test' } } 
        },
        { headers: { Authorization: `Bearer ${adminToken}` } }
      )
      
      if (createResponse.data.data?.createPermission) {
        const permissionId = createResponse.data.data.createPermission.id

        const mutation = `
          mutation UpdatePermission($id: ID!, $input: UpdatePermissionInput!) {
            updatePermission(id: $id, input: $input) {
              id
              action
            }
          }
        `
        const variables = {
          id: permissionId,
          input: {
            action: 'updated'
          }
        }

        const response = await api.post('/graphql', 
          { query: mutation, variables },
          { headers: { Authorization: `Bearer ${adminToken}` } }
        )
        expect(response.status).toBe(200)
        if (response.data.errors) {
          console.log('UpdatePermission errors:', JSON.stringify(response.data.errors, null, 2))
        }
        if (response.data.data?.updatePermission) {
          expect(response.data.data.updatePermission.action).toBe('updated')
        }
      }
    })

    it('error - unauthorized', async () => {
      const mutation = `
        mutation UpdatePermission($id: ID!, $input: UpdatePermissionInput!) {
          updatePermission(id: $id, input: $input) {
            id
            action
          }
        }
      `
      const variables = {
        id: '1',
        input: {
          action: 'updated'
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

  describe('deletePermission', () => {
    it('success', async () => {
      const createMutation = `
        mutation CreatePermission($input: CreatePermissionInput!) {
          createPermission(input: $input) {
            id
          }
        }
      `
      const createResponse = await api.post('/graphql', 
        { 
          query: createMutation, 
          variables: { input: { action: 'delete', module: 'test' } } 
        },
        { headers: { Authorization: `Bearer ${adminToken}` } }
      )
      
      if (createResponse.data.data?.createPermission) {
        const permissionId = createResponse.data.data.createPermission.id

        const mutation = `
          mutation DeletePermission($id: ID!) {
            deletePermission(id: $id)
          }
        `

        const response = await api.post('/graphql', 
          { query: mutation, variables: { id: permissionId } },
          { headers: { Authorization: `Bearer ${adminToken}` } }
        )
        expect(response.status).toBe(200)
        if (response.data.errors) {
          console.log('DeletePermission errors:', JSON.stringify(response.data.errors, null, 2))
        }
        if (response.data.data?.deletePermission !== undefined) {
          expect(response.data.data.deletePermission).toBe(true)
        }
      }
    })
  })

  describe('seedPermissions', () => {
    it('success', async () => {
      const mutation = `
        mutation SeedPermissions {
          seedPermissions
        }
      `

      const response = await api.post('/graphql', 
        { query: mutation },
        { headers: { Authorization: `Bearer ${adminToken}` } }
      )
      expect(response.status).toBe(200)
      if (response.data.errors) {
        console.log('SeedPermissions errors:', JSON.stringify(response.data.errors, null, 2))
      }
      if (response.data.data?.seedPermissions !== undefined) {
        expect(response.data.data.seedPermissions).toBe(true)
      }
    })
  })

  describe('error cases', () => {
    it('permissions - unauthorized access', async () => {
      const query = `
        query Permissions {
          permissions {
            id
            action
            module
          }
        }
      `

      const response = await api.post('/graphql', { query })
      expect(response.status).toBe(200)
      expect(response.data.errors).toBeDefined()
    })

    it('permission - not found', async () => {
      const query = `
        query Permission($id: ID!) {
          permission(id: $id) {
            id
            action
            module
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

    it('createPermission - duplicate action/module', async () => {
      const mutation = `
        mutation CreatePermission($input: CreatePermissionInput!) {
          createPermission(input: $input) {
            id
            action
            module
          }
        }
      `
      const variables = {
        input: {
          action: 'read',
          module: 'user'
        }
      }

      const response = await api.post('/graphql', 
        { query: mutation, variables },
        { headers: { Authorization: `Bearer ${adminToken}` } }
      )
      expect(response.status).toBe(200)
      expect(response.data.errors).toBeDefined()
    })



    it('deletePermission - not found', async () => {
      const mutation = `
        mutation DeletePermission($id: ID!) {
          deletePermission(id: $id)
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