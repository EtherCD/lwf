import { LWF, LWFSchema } from '../src'

const schema: LWFSchema = {
  a: {
    isKeyedObject: true,
    root: true,
    key: '',
    args: ['x', 'y', 'author', 'color', 'tag'],
    includes: ['b'],
  },
  b: {
    key: 'user',
    args: ['name', 'id'],
  },
}

//const canvas = JSON.parse(fs.readFileSync(fileName + ".json") + "");

//fs.writeFileSync(fileName + ".lwf", LWF.stringify(canvas, schema));

const canvas = {
  0: {
    x: 0,
    y: 0,
    author: 'EtherCD',
    color: '#ffffff',
    tag: 'Eevee',
    user: {
      name: 'sd',
      id: 'sad',
    },
  },
  1: {
    x: 1,
    y: 0,
    author: 'EtherCD',
    color: '#ffffff',
    tag: 'Eevee',
  },
}

const translated = 'a[0,0,0,EtherCD,#ffffff,Eevee]b[sd,sad]a[1,1,0,EtherCD,#ffffff,Eevee]'

test('Some test', () => {
  expect(LWF.stringify(canvas, schema)).toBe(translated)
})

test('Other test', () => {
  expect(LWF.parse(translated, schema)).toStrictEqual(canvas)
})
