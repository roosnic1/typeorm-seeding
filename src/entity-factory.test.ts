import { EntityFactory } from './entity-factory'
import * as moment from 'moment'

describe('make', () => {
  // tslint:disable-next-line
  class User {
    constructor(public name: string) {}
  }
  // tslint:disable-next-line
  class Pet {
    constructor(public name: string, public user: User) {}
  }
  //tslint:disable-next-line
  class Event {
    constructor(public name: string, public date: moment.Moment) {}
  }

  test('Should make a new entity', async () => {
    const mockUserFactory = jest.fn()
    const userFactory = new EntityFactory('User', User, mockUserFactory)
    mockUserFactory.mockReturnValue(new User('Steve'))

    const newUser = await userFactory.make()

    expect(newUser.name).toBe('Steve')
  })

  test('Should override the enitys props', async () => {
    const mockUserFactory = jest.fn()
    const userFactory = new EntityFactory('User', User, mockUserFactory)
    mockUserFactory.mockReturnValue(new User('Steve'))

    const newUser = await userFactory.make({ name: 'Tony' })

    expect(newUser.name).toBe('Tony')
  })

  test('Should call the nested entity factories', async () => {
    const mockUserFactory = jest.fn()
    const userFactory = new EntityFactory('User', User, mockUserFactory)

    const mockPetFactory = jest.fn()
    const petFactory = new EntityFactory('Pet', Pet, mockPetFactory)

    mockUserFactory.mockReturnValue({
      name: 'Pepper',
    })

    mockPetFactory.mockReturnValue({
      name: 'Bunny',
      user: userFactory,
    })

    const newPet = await petFactory.make()

    expect(newPet.name).toBe('Bunny')
    expect(newPet.user.name).toBe('Pepper')
  })

  test('Should call the map function', async () => {
    const mockUserFactory = jest.fn()
    const userFactory = new EntityFactory('User', User, mockUserFactory)
    mockUserFactory.mockReturnValue(new User('Steve'))
    const mockMap = jest.fn()

    const newUsers = await userFactory.map(mockMap).makeMany(2)

    expect(newUsers.length).toBe(2)
    expect(mockMap).toBeCalledTimes(2)
  })

  test('Should not call make on Moment objects', async () => {
    const mockEventFactory = jest.fn()
    const eventFactory = new EntityFactory('Event', Event, mockEventFactory)
    console.log('moment', moment())
    mockEventFactory.mockReturnValue(new Event('Steve', moment()))

    const newEvent = await eventFactory.make()

    expect(moment.isMoment(newEvent.date)).toBe(true)
  })
})
