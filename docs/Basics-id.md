# Dasar-Dasar Penggunaan Format

Format ini menyimpan data dalam bentuk blok tanpa mengasumsikan bagaimana data tersebut akan didekode nantinya. Keputusan ini dibuat untuk kepentingan kompaktitas dan kompresi yang lebih efisien menggunakan algoritma.

Anda perlu membuat skema yang menjelaskan:
a. Data apa yang terkandung dalam objek.
b. Cara mengubah data ini menjadi string.
c. Cara mengembalikan data dari format string.

Saat ini, format ini sedang dalam pengembangan dan berfungsi, tetapi mungkin tidak universal untuk semua kasus penggunaan.

## Nesting dan Objek

Skema paling sederhana terlihat seperti ini:

```ts
const schema: LWFScheme = {
  // Tentukan header yang akan ditulis sebelum blok data
  // Format: {header}[data]
  // Dalam kasus ini, header akan menjadi "a"
  a: {
    // Kunci objek yang akan diproses dalam blok data ini
    key: 'store',
    // Semua data bersarang yang dapat ditulis dalam satu string, tidak termasuk objek dan array
    // Kunci harus dicantumkan dalam urutan yang memastikan efisiensi maksimal
    // Ini bukan persyaratan ketat, tetapi perlu diperhatikan bahwa, misalnya, ["x", "y"]
    // akan tidak efisien jika kunci pertama "x" sering tidak ada, karena akan menghasilkan a[,,,10]
    args: ['name', 'owner'],
  },
}

const object = {
  store: {
    name: 'Best Computers!',
    owner: 'Eliot',
  },
}

const result = LWF.stringify(object, schema) // Mengembalikan a[Best Computers!,Eliot]
LWF.parse(result, schema) // Harus mengembalikan objek yang identik dengan input
```

Sekarang mari tambahkan objek bersarang, misalnya, untuk menentukan apa yang dijual toko kami:

```ts
const schema: LWFScheme = {
  a: {
    key: 'store',
    args: ['name', 'owner'],
    // Tentukan header skema yang akan digunakan untuk mengubah data di dalam
    // objek toko
    includes: ['b'],
  },
  b: {
    key: 'forSale',
    // Tunjukkan bahwa objek di bawah kunci ini adalah array
    isArray: true,
    args: ['name', 'price'],
  },
}

const object = {
  store: {
    name: 'Best Computers!',
    owner: 'Eliot',
    forSale: [
      {
        name: 'Cool processor',
        price: 'Nice money',
      },
    ],
  },
}

const result = LWF.stringify(object, schema) // Mengembalikan a[Best Computers!,Eliot]b[Cool processor,Nice money]
LWF.parse(result, schema) // Harus mengembalikan objek yang identik dengan input
```

Untuk bekerja dengan objek yang kuncinya adalah pengidentifikasi unik (misalnya, "forSale"), kita dapat menentukan bahwa itu adalah objek dengan kunci dinamis. Dalam contoh ini, kami mengimplementasikannya sebagai berikut:

```ts
const schema: LWFScheme = {
  a: {
    key: 'store',
    args: ['name', 'owner'],
    includes: ['b'], // Hubungkan skema untuk objek bersarang
  },
  b: {
    key: 'forSale',
    // Tunjukkan bahwa objek di bawah kunci ini adalah objek dengan kunci dinamis
    isKeyedObject: true,
    args: ['name', 'price'],
  },
}

const object = {
  store: {
    name: 'Best Computers!',
    owner: 'Eliot',
    forSale: {
      0: {
        name: 'Cool processor',
        price: 'Nice money',
      },
    },
  },
}

const result = LWF.stringify(object, schema) // Mengembalikan a[Best Computers!,Eliot]b[0,Cool processor,Nice money]
LWF.parse(result, schema) Harus mengembalikan objek yang identik dengan input
```

Ini adalah prinsip dasar bekerja dengan format ini dan penggunaannya.

## Skema yang Lebih Kompleks

Untuk menentukan cara bekerja dengan elemen root, kita memerlukan skema berikut:

```ts
const schema: LWFScheme = {
  a: {
    key: 'store',
    args: ['name', 'owner'],
    // Tunjukkan bahwa skema ini akan menjadi root dan berlaku untuk seluruh objek
    root: true,
    // Selanjutnya, kita dapat menentukan parameter tambahan
    isKeyedObject: true,
    // Atau
    isArray: true,
    // Atau objek bersarang
    included: [],
  },
}
```

Karena format ini mengabaikan nilai kosong dan tidak memasukkannya ke dalam objek akhir, untuk menentukan argumen yang mungkin kosong tetapi selalu diperlukan, kita dapat melakukan hal berikut:

```ts
const schema: LWFScheme = {
  a: {
    key: 'store',
    args: ['name', 'owner'],
    root: true,
    // Tentukan argumen yang diperlukan
    // ["Nama argumen", "Nilai default jika argumen tidak ada"]
    requiredArgs: [['name', '']],
  },
}
```

Jika kita perlu membuat objek tetapi menulis semua argumen di dalam objek bersarang:

```ts
const schema: LWFScheme = {
  a: {
    key: 'store',
    args: ['name', 'owner'],
    // Dalam kasus ini, data akan ditulis bukan ke dalam objek itu sendiri, tetapi ke dalam objek bersarang dengan kunci "info"
    in: 'info',
  },
}
```

Ini mengakhiri deskripsi format untuk saat ini. Saya akan terus mengembangkan dan menyempurnakannya.
