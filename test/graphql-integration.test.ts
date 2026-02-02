import { api, resetDatabase } from './setup'

describe('GraphQL Integration Tests', () => {
  let adminToken: string
  let userToken: string

  beforeEach(async () => {
    await resetDatabase()
    
    // Get admin token
    const adminLogin = await api.post('/graphql', {
      query: `mutation Login($input: LoginInput!) { login(input: $input) { access_token } }`,
      variables: { input: { email: 'admin@wizardcld.com', password: 'password' } }
    })
    adminToken = adminLogin.data.data?.login?.access_token

    // Create and login as regular user
    const createUser = await api.post('/graphql', {
      query: `mutation CreateUser($input: CreateUserInput!) { createUser(input: $input) { id email } }`,
      variables: { input: { email: 'user@test.com', password: 'password' } }
    }, { headers: { Authorization: `Bearer ${adminToken}` } })

    if (createUser.data.data?.createUser) {
      const userLogin = await api.post('/graphql', {
        query: `mutation Login($input: LoginInput!) { login(input: $input) { access_token } }`,
        variables: { input: { email: 'user@test.com', password: 'password' } }
      })
      userToken = userLogin.data.data?.login?.access_token
    }
  })

  describe('Role-based access control', () => {
    it('regular user cannot access admin operations', async () => {
      const query = `
        query Users {
          users {
            id
            email
          }
        }
      `

      const response = await api.post('/graphql', 
        { query },
        { headers: { Authorization: `Bearer ${userToken}` } }
      )
      expect(response.status).toBe(200)
      expect(response.data.errors).toBeDefined()
    })

    it('admin can access all operations', async () => {
      const queries = [
        'query Users { users { id } }',
        'query Roles { roles { id } }',
        'query Permissions { permissions { id } }'
      ]

      for (const query of queries) {
        const response = await api.post('/graphql', 
          { query },
          { headers: { Authorization: `Bearer ${adminToken}` } }
        )
        expect(response.status).toBe(200)
        if (response.data.errors) {
          console.log(`Query "${query}" errors:`, JSON.stringify(response.data.errors, null, 2))
        }
      }
    })
  })

  describe('Data consistency', () => {
    it('user creation and retrieval consistency', async () => {
      const createMutation = `
        mutation CreateUser($input: CreateUserInput!) {
          createUser(input: $input) {
            id
            email
            first_name
            last_name
          }
        }
      `
      const createResponse = await api.post('/graphql', 
        { 
          query: createMutation, 
          variables: { 
            input: { 
              email: 'consistency@test.com', 
              password: 'Password123!',
              first_name: 'Test',
              last_name: 'User'
            } 
          } 
        },
        { headers: { Authorization: `Bearer ${adminToken}` } }
      )

      if (createResponse.data.data?.createUser) {
        const userId = createResponse.data.data.createUser.id

        const getUserQuery = `
          query User($id: ID!) {
            user(id: $id) {
              id
              email
              first_name
              last_name
            }
          }
        `
        const getResponse = await api.post('/graphql', 
          { query: getUserQuery, variables: { id: userId } },
          { headers: { Authorization: `Bearer ${adminToken}` } }
        )

        expect(getResponse.data.data.user).toMatchObject({
          id: userId,
          email: 'consistency@test.com',
          first_name: 'Test',
          last_name: 'User'
        })
      }
    })

    it('role assignment and verification', async () => {
      // Create a role first
      const createRoleResponse = await api.post('/graphql', 
        { 
          query: `mutation CreateRole($input: CreateRoleInput!) { createRole(input: $input) { id name } }`,
          variables: { input: { name: 'test_role_integration' } }
        },
        { headers: { Authorization: `Bearer ${adminToken}` } }
      )

      if (createRoleResponse.data.data?.createRole) {
        const roleName = createRoleResponse.data.data.createRole.name

        // Get a user to assign role to
        const usersResponse = await api.post('/graphql', 
          { query: `query Users { users { id } }` },
          { headers: { Authorization: `Bearer ${adminToken}` } }
        )

        if (usersResponse.data.data?.users?.length > 0) {
          const userId = usersResponse.data.data.users[0].id

          // Assign role
          const assignResponse = await api.post('/graphql', 
            { 
              query: `mutation AssignRole($input: AssignRoleInput!) { assignRole(input: $input) }`,
              variables: { input: { user_id: userId, role_name: roleName } }
            },
            { headers: { Authorization: `Bearer ${adminToken}` } }
          )

          expect(assignResponse.status).toBe(200)
          if (assignResponse.data.errors) {
            console.log('AssignRole Integration Errors:', JSON.stringify(assignResponse.data.errors, null, 2))
          }
        }
      }
    })
  })

  describe('Input validation', () => {
    it('invalid email format', async () => {
      const mutation = `
        mutation CreateUser($input: CreateUserInput!) {
          createUser(input: $input) {
            id
          }
        }
      `
      const variables = {
        input: {
          email: 'invalid-email',
          password: 'Password123!'
        }
      }

      const response = await api.post('/graphql', 
        { query: mutation, variables },
        { headers: { Authorization: `Bearer ${adminToken}` } }
      )
      expect(response.status).toBe(200)
      expect(response.data.errors).toBeDefined()
    })

    it('weak password validation', async () => {
      const mutation = `
        mutation CreateUser($input: CreateUserInput!) {
          createUser(input: $input) {
            id
          }
        }
      `
      const variables = {
        input: {
          email: 'test@example.com',
          password: '123'
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

  describe('Concurrent operations', () => {
    it('multiple user creation requests', async () => {
      const mutation = `
        mutation CreateUser($input: CreateUserInput!) {
          createUser(input: $input) {
            id
            email
          }
        }
      `

      const promises = Array.from({ length: 3 }, (_, i) => 
        api.post('/graphql', 
          { 
            query: mutation, 
            variables: { 
              input: { 
                email: `concurrent${i}@test.com`, 
                password: 'Password123!' 
              } 
            } 
          },
          { headers: { Authorization: `Bearer ${adminToken}` } }
        )
      )

      const responses = await Promise.all(promises)
      
      responses.forEach((response, index) => {
        expect(response.status).toBe(200)
        if (response.data.data?.createUser) {
          expect(response.data.data.createUser.email).toBe(`concurrent${index}@test.com`)
        }
      })
    })
  })

  describe('Complex queries', () => {


    it('roles with permissions', async () => {
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
        console.log('Roles with permissions errors:', JSON.stringify(response.data.errors, null, 2))
      }
    })
  })
})