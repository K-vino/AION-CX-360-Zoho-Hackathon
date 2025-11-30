const axios = require('axios');
const fs = require('fs');

const params = new URLSearchParams();
params.append('grant_type', 'authorization_code');
params.append('client_id', '1000.YMBFTTF3CZRTGSFPNM28ZPKETH6G5E');
params.append('client_secret', '98792c0c2afa041a55fad2ce34b179a02fd8a496a9');
params.append('redirect_uri', 'http://localhost:3000/oauth/callback');
params.append('code', '1000.48eae394c36ca965b5b3f4e91d24295b.e56503777e4f81955bf6c5f2855d4408');

console.log("Requesting token with params:", params.toString());

axios.post('https://accounts.zoho.com/oauth/v2/token', params)
    .then(res => {
        fs.writeFileSync('token_output.json', JSON.stringify(res.data, null, 2));
        console.log("Token saved to token_output.json");
    })
    .catch(err => {
        const errorData = err.response ? err.response.data : err.message;
        fs.writeFileSync('token_error.json', JSON.stringify(errorData, null, 2));
        console.error("Error saved to token_error.json");
    });
