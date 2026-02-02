import { Injectable } from '@nestjs/common'
import { Prisma, Role } from '@prisma/client'
import { map } from 'lodash'

import { CommonService } from '@/common/common.service'
import { PrismaService } from '@/prisma/prisma.service'
import { RoleService } from '@/role/role.service'
import { CreateUserInput, UpdateUserInput } from '@/user/user.inputs'

@Injectable()
export class UserService {
  constructor(
    private commonService: CommonService,
    private prismaService: PrismaService,
    private roleService: RoleService
  ) {}

  async create(createUserInput: CreateUserInput) {
    const hashedPassword = await this.commonService.hashPassword(createUserInput.password)
    return this.prismaService.user.create({
      data: {
        ...createUserInput,
        password: hashedPassword
      }
    })
  }

  async findAll() {
    return this.prismaService.user.findMany({
      include: {
        role_users: {
          include: {
            role: true
          }
        }
      }
    })
  }

  async findOne(options: Prisma.UserFindUniqueArgs) {
    return this.prismaService.user.findUnique({
      ...options,
      include: { ...options?.include, role_users: { include: { role: true } } }
    })
  }

  async update(id: string, updateUserInput: UpdateUserInput) {
    try {
      return this.prismaService.user.update({
        where: { id },
        data: updateUserInput
      })
    } catch (error: unknown) {
      if (error instanceof Object && 'code' in error && error.code === 'P2025') {
        throw new Error('USER_NOT_FOUND')
      }
      throw error
    }
  }

  async seedTestUsers(roles: Role[]) {
    const adminRole = roles.find((r) => r.name === 'admin')
    const developerRole = roles.find((r) => r.name === 'developer')
    const userRole = roles.find((r) => r.name === 'user')
    if (!userRole) {
      throw new Error('USER_ROLE_NOT_FOUND')
    }

    const hashedPassword = await this.commonService.hashPassword('password')
    const users = await this.prismaService.user.createManyAndReturn({
      data: [
        {
          email: 'admin@wizardcld.com',
          first_name: 'Test',
          last_name: 'User 1',
          password: hashedPassword,
          status: 'active'
        },
        {
          email: 'test-2@wizardcld.com',
          first_name: 'Test',
          last_name: 'User 2',
          password: hashedPassword,
          status: 'active'
        },
        {
          email: 'test-3@wizardcld.com',
          first_name: 'Test',
          last_name: 'User 3',
          password: hashedPassword,
          status: 'active'
        }
      ]
    })
    const roleAssignments = map(users, (u) => ({ user_id: u.id, role_id: userRole.id! }))

    if (users[0] && adminRole) {
      roleAssignments.push({ role_id: adminRole.id, user_id: users[0].id })
    }
    if (users[1] && developerRole) {
      roleAssignments.push({ role_id: developerRole.id, user_id: users[1].id })
    }

    await this.prismaService.roleUser.createManyAndReturn({ data: roleAssignments, skipDuplicates: true })

    return users
  }

  async remove(id: string) {
    try {
      return this.prismaService.user.delete({
        where: { id }
      })
    } catch (error: unknown) {
      if (error instanceof Object && 'code' in error && error.code === 'P2025') {
        throw new Error('USER_NOT_FOUND')
      }
      throw error
    }
  }
}
