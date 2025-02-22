import { LWFSchema } from '../src/types'
import { LWF } from '../src/index'
import util from 'util'

const schema: LWFSchema = {
  x: {
    root: true,
    key: '',
    isArray: true,
    args: [],
    includes: ['m', 's', 'p', 'n', 'j', 'c', 'd', 'r', 'g', 'o', 'a', 'u', 'q'],
  },
  m: {
    key: 'm',
    args: ['role', 'author', 'msg', 'color', 'world', 'id'],
  },
  s: {
    key: 's',
    args: [
      'hero',
      'name',
      'id',
      'role',
      'area',
      'world',
      'x',
      'y',
      'radius',
      'firstAbMaxLvl',
      'secondAbMaxLvl',
      'firstAbLvl',
      'secondAbLvl',
      'regen',
      'speed',
      'energy',
      'maxEnergy',
    ],
  },
  p: {
    key: 'pls',
    isArray: true,
    args: ['hero', 'name', 'id', 'role', 'area', 'world', 'died', 'dTimer'],
  },
  n: {
    key: 'np',
    args: ['hero', 'name', 'id', 'role', 'area', 'world', 'died', 'dTimer'],
  },
  j: {
    key: 'jp',
    args: ['id', 'x', 'y', 'radius', 'energy', 'maxEnergy', 'color'],
  },
  c: {
    key: 'cp',
    isArray: true,
    args: [],
  },
  d: {
    key: 'dm',
    args: [],
  },
  r: {
    key: 'ne',
    args: ['x', 'y', 'radius', 'type', 'color', 'stroke', 'harmless', 'aura', 'energy'],
  },
  g: {
    key: 'ue',
    args: ['x', 'y', 'radius', 'type', 'color', 'stroke', 'harmless', 'aura', 'energy'],
  },
  o: {
    key: 'ce',
    isArray: true,
    args: [],
  },
  a: {
    key: 'ai',
    args: ['x', 'y', 'w', 'h', 'area', 'world'],
    includes: ['z', 'e', 'i'],
  },
  z: {
    key: 'zones',
    isArray: true,
    args: ['type', 'x', 'y', 'w', 'h'],
  },
  e: {
    key: 'entities',
    isKeyedObject: true,
    args: ['x', 'y', 'radius', 'type', 'color', 'stroke', 'harmless', 'aura', 'energy'],
  },
  i: {
    key: 'players',
    isKeyedObject: true,
    args: ['id', 'x', 'y', 'radius', 'energy', 'maxEnergy', 'color'],
  },
  u: {
    key: 'up',
    args: [
      'id',
      'radius',
      'energy',
      'speed',
      'regen',
      'firstAbLvl',
      'secondAbLvl',
      'maxEnergy',
      'world',
      'area',
      'died',
      'dTimer',
      'color',
    ],
  },
  q: {
    key: 'p',
    args: [
      'id',
      'radius',
      'energy',
      'speed',
      'regen',
      'firstAbLvl',
      'secondAbLvl',
      'maxEnergy',
      'world',
      'area',
      'died',
      'dTimer',
      'color',
    ],
  },
}

const object = [
  {
    m: {
      role: 'some',
      author: 'author',
      msg: 'Hello World!',
    },
  },
  {
    ai: {
      x: 0,
      y: 0,
      w: 0,
      h: 0,
      area: 0,
      world: 'asd',
      entities: {
        0: {
          x: 0,
          y: 0,
          radius: 15,
          type: 'some',
        },
      },
      zones: [
        {
          type: 'some',
          x: 0,
          y: 0,
          w: 10,
          h: 10,
        },
      ],
    },
  },
]

const result = 'x[]m[some,author,Hello World!]x[]a[0,0,0,0,0,asd]e[0,0,0,15,some]z[some,0,0,10,10]'

test('General stringify', () => {
  expect(LWF.stringify(object, schema)).toBe(result)
})

test('General parse', () => {
  expect(LWF.parse(result, schema)).toStrictEqual(object)
})
