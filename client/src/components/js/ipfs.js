const ipfsClient = require('ipfs-http-client');
const pinataApiKey = '97d054fd0ad5b021e0a8'; // replace with your actual Pinata API Key
const pinataSecretApiKey = '7fcdafeade8a45f0de5623cdbec7daf461e1f85fd8966329b54be8b064f6a054'; // replace with your actual Pinata Secret API Key
const gatewayToken = 'y134JeRV-9ryiDiW_FuCrjGThPN7zZPeRT_z3zuptbS06TxVxKjYOlg1T8WVVZQx'; // replace with your actual Pinata Secret API Key
const JWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiJhMDIzMjE3NC02ZWZiLTQ0NGItYjYzNi04YTA0M2NkNDI4ODYiLCJlbWFpbCI6InBhaHBhaGRvd0BnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwicGluX3BvbGljeSI6eyJyZWdpb25zIjpbeyJpZCI6IkZSQTEiLCJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MX0seyJpZCI6Ik5ZQzEiLCJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MX1dLCJ2ZXJzaW9uIjoxfSwibWZhX2VuYWJsZWQiOmZhbHNlLCJzdGF0dXMiOiJBQ1RJVkUifSwiYXV0aGVudGljYXRpb25UeXBlIjoic2NvcGVkS2V5Iiwic2NvcGVkS2V5S2V5IjoiOTdkMDU0ZmQwYWQ1YjAyMWUwYTgiLCJzY29wZWRLZXlTZWNyZXQiOiI3ZmNkYWZlYWRlOGE0NWYwZGU1NjIzY2RiZWM3ZGFmNDYxZTFmODVmZDg5NjYzMjliNTRiZThiMDY0ZjZhMDU0IiwiaWF0IjoxNzA3MDY1ODczfQ.-8pgwdVJOUvGC7MSp1f6bx-NVqgpHfuoy6JI1Ko5L7Q'

const ipfs = ipfsClient({
    host: 'ivory-mad-smelt-651.mypinata.cloud',
    port: 5001,
    protocol: 'https',
    headers: {
        pinata_api_key: pinataApiKey,
        pinata_secret_api_key: pinataSecretApiKey,
        'x-pinata-gateway-token': gatewayToken,
        Authorization: `Bearer ${JWT}`,
    },
});

export default ipfs;
