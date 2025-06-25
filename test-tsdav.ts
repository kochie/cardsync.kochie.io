import {
  createDAVClient,
} from "tsdav";

const client = await createDAVClient({
  serverUrl: 'https://carddav.fastmail.com/',
  credentials: {
    username: 'robert@kochie.io',
    password: '25876z66527q487s',
  },
  authMethod: 'Basic',
  defaultAccountType: 'carddav',
});

// const authHeaders = getBasicAuthHeaders({
//   username: "robert@kochie.io",
//   password: "6g395e8m4w5d4u6y",
// });
// const account = await createAccount({
//   account: {
//     serverUrl: "https://carddav.fastmail.com/",
//     accountType: "carddav",
//   },
//   headers: authHeaders,
// });

const addressBooks = await client.fetchAddressBooks()

console.log("Address Books:", addressBooks);

const cards = await client.fetchVCards({addressBook: addressBooks[0]})

// console.log("Cards:", cards);


delete cards[0].etag;
console.log("First Card:", cards[0]);

const response = await client.updateVCard({
    vCard: cards[0],
})


// const data = await fetchAddressBooks({ account, headers: authHeaders });

console.log("Response:", response);
