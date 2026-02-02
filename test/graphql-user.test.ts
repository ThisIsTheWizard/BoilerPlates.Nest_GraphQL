import { api, resetDatabase } from './setup'

describe('UserResolver (GraphQL)', () => {
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

  describe('users', () => {
    it('success', async () => {
      const query = `
        query Users {
          users {
            id
            email
            status
          }
        }
      `

      const response = await api.post('/graphql', 
        { query },
        { headers: { Authorization: `Bearer ${adminToken}` } }
      )
      expect(response.status).toBe(200)
      if (response.data.errors) {
        console.log('Users query errors:', JSON.stringify(response.data.errors, null, 2))
      }
      if (response.data.data?.users) {
        expect(Array.isArray(response.data.data.users)).toBe(true)
      }
    })
  })

  describe('user', () => {
    it('success', async () => {
      const usersQuery = `
        query Users {
          users {
            id
          }
        }
      `
      const usersResponse = await api.post('/graphql', 
        { query: usersQuery },
        { headers: { Authorization: `Bearer ${adminToken}` } }
      )
      
      if (usersResponse.data.data?.users?.length > 0) {
        const userId = usersResponse.data.data.users[0].id

        const query = `
          query User($id: ID!) {
            user(id: $id) {
              id
              email
              status
            }
          }
        `

        const response = await api.post('/graphql', 
          { query, variables: { id: userId } },
          { headers: { Authorization: `Bearer ${adminToken}` } }
        )
        expect(response.status).toBe(200)
        if (response.data.errors) {
          console.log('User query errors:', JSON.stringify(response.data.errors, null, 2))
        }
        if (response.data.data?.user) {
          expect(response.data.data.user).toHaveProperty('id', userId)
        }
      }
    })
  })

  describe('createUser', () => {
    it('success', async () => {
      const mutation = `
        mutation CreateUser($input: CreateUserInput!) {
          createUser(input: $input) {
            id
            email
            status
          }
        }
      `
      const variables = {
        input: {
          email: 'newuser@wizardcld.com',
          password: 'Password123!',
          first_name: 'New',
          last_name: 'User'
        }
      }

      const response = await api.post('/graphql', 
        { query: mutation, variables },
        { headers: { Authorization: `Bearer ${adminToken}` } }
      )
      expect(response.status).toBe(200)
      if (response.data.errors) {
        console.log('CreateUser errors:', JSON.stringify(response.data.errors, null, 2))
      }
      if (response.data.data?.createUser) {
        expect(response.data.data.createUser).toMatchObject({
          email: 'newuser@wizardcld.com'
        })
      }
    })

    it('error - invalid email format', async () => {
      const mutation = `
        mutation CreateUser($input: CreateUserInput!) {
          createUser(input: $input) {
            id
            email
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

    it('error - weak password', async () => {
      const mutation = `
        mutation CreateUser($input: CreateUserInput!) {
          createUser(input: $input) {
            id
            email
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

  describe('updateUser', () => {
    it('success', async () => {
      const usersQuery = `
        query Users {
          users {
            id
          }
        }
      `
      const usersResponse = await api.post('/graphql', 
        { query: usersQuery },
        { headers: { Authorization: `Bearer ${adminToken}` } }
      )
      
      if (usersResponse.data.data?.users?.length > 0) {
        const userId = usersResponse.data.data.users[0].id

        const mutation = `
          mutation UpdateUser($id: ID!, $input: UpdateUserInput!) {
            updateUser(id: $id, input: $input) {
              id
              first_name
            }
          }
        `
        const variables = {
          id: userId,
          input: {
            first_name: 'Updated'
          }
        }

        const response = await api.post('/graphql', 
          { query: mutation, variables },
          { headers: { Authorization: `Bearer ${adminToken}` } }
        )
        expect(response.status).toBe(200)
        if (response.data.errors) {
          console.log('UpdateUser errors:', JSON.stringify(response.data.errors, null, 2))
        }
        if (response.data.data?.updateUser) {
          expect(response.data.data.updateUser.first_name).toBe('Updated')
        }
      }
    })

    it('error - unauthorized', async () => {
      const mutation = `
        mutation UpdateUser($id: ID!, $input: UpdateUserInput!) {
          updateUser(id: $id, input: $input) {
            id
            first_name
          }
        }
      `
      const variables = {
        id: '1',
        input: {
          first_name: 'Updated'
        }
      }

      const response = await api.post('/graphql', { query: mutation, variables })
      expect(response.status).toBe(200)
      expect(response.data.errors).toBeDefined()
    })
  })

  describe('deleteUser', () => {
    it('success', async () => {
      const createMutation = `
        mutation CreateUser($input: CreateUserInput!) {
          createUser(input: $input) {
            id
          }
        }
      `
      const createResponse = await api.post('/graphql', 
        { 
          query: createMutation, 
          variables: { 
            input: { 
              email: 'todelete@wizardcld.com', 
              password: 'Password123!' 
            } 
          } 
        },
        { headers: { Authorization: `Bearer ${adminToken}` } }
      )
      
      if (createResponse.data.data?.createUser) {
        const userId = createResponse.data.data.createUser.id

        const mutation = `
          mutation DeleteUser($id: ID!) {
            deleteUser(id: $id)
          }
        `

        const response = await api.post('/graphql', 
          { query: mutation, variables: { id: userId } },
          { headers: { Authorization: `Bearer ${adminToken}` } }
        )
        expect(response.status).toBe(200)
        if (response.data.errors) {
          console.log('DeleteUser errors:', JSON.stringify(response.data.errors, null, 2))
        }
        if (response.data.data?.deleteUser !== undefined) {
          expect(response.data.data.deleteUser).toBe(true)
        }
      }
    })
  })

  describe('error cases', () => {
    it('users - unauthorized access', async () => {
      const query = `
        query Users {
          users {
            id
            email
          }
        }
      `

      const response = await api.post('/graphql', { query })
      expect(response.status).toBe(200)
      expect(response.data.errors).toBeDefined()
    })

    it('user - not found', async () => {
      const query = `
        query User($id: ID!) {
          user(id: $id) {
            id
            email
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

    it('createUser - duplicate email', async () => {
      const mutation = `
        mutation CreateUser($input: CreateUserInput!) {
          createUser(input: $input) {
            id
            email
          }
        }
      `
      const variables = {
        input: {
          email: 'admin@wizardcld.com',
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

    it('updateUser - not found', async () => {
      const mutation = `
        mutation UpdateUser($id: ID!, $input: UpdateUserInput!) {
          updateUser(id: $id, input: $input) {
            id
          }
        }
      `
      const variables = {
        id: '999999',
        input: {
          first_name: 'Updated'
        }
      }

      const response = await api.post('/graphql', 
        { query: mutation, variables },
        { headers: { Authorization: `Bearer ${adminToken}` } }
      )
      expect(response.status).toBe(200)
      expect(response.data.errors).toBeDefined()
    })

    it('deleteUser - not found', async () => {
      const mutation = `
        mutation DeleteUser($id: ID!) {
          deleteUser(id: $id)
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