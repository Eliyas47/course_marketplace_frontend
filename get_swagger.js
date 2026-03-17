const axios = require('axios');

async function getSwagger() {
  try {
    const response = await axios.get('https://online-course-marketplace-backend-dc66.onrender.com/swagger/?format=openapi', {
      timeout: 30000,
      headers: {
        'Accept': 'application/json'
      }
    });
    console.log(JSON.stringify(response.data, null, 2));
  } catch (error) {
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
}

getSwagger();
