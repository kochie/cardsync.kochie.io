import * as dav from 'dav';
import { parse } from 'vcard4';
import fs from 'fs';

// Replace with your actual Fastmail CardDAV credentials
const CREDENTIALS = {
  username: 'robert@kochie.io',
  password: '432d3f6q8r4j7r57',
  serverUrl: 'https://carddav.fastmail.com/dav/addressbooks/user/robert@kochie.io/Default'
};

async function getCards() {
  const xhr = new dav.transport.Basic(
    new dav.Credentials({
      username: CREDENTIALS.username,
      password: CREDENTIALS.password
    })
  );

  // Discover address books
  const account = await dav.createAccount({
    accountType: "carddav",
    server: CREDENTIALS.serverUrl,
    xhr,
    loadObjects: true,
    loadCollections: true
  });

  const addressBook = account.addressBooks?.[0];
  if (!addressBook || !addressBook.objects) {
    console.error('No address book or contacts found.');
    return;
  }

}

getCards().catch(console.error);