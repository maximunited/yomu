const fetch = require('node-fetch');

async function testAPI() {
  try {
    console.log('Testing benefits API...');
    
    const response = await fetch('http://localhost:3000/api/benefits');
    const data = await response.json();
    
    console.log('Response status:', response.status);
    console.log('Benefits found:', data.benefits?.length || 0);
    
    if (data.benefits) {
      data.benefits.forEach(benefit => {
        console.log(`- ${benefit.title} (${benefit.brand.name})`);
      });
    }
    
  } catch (error) {
    console.error('Error testing API:', error.message);
  }
}

testAPI(); 