async function testAPI() {
  try {
    console.log('Testing benefits API...');
    
    const response = await fetch('http://localhost:3000/api/benefits');
    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers.get('content-type'));
    
    if (!response.ok) {
      const text = await response.text();
      console.error('API Error Response:', text.substring(0, 200) + '...');
      return;
    }
    
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      console.error('Expected JSON but got:', contentType);
      console.error('Response body:', text.substring(0, 200) + '...');
      return;
    }
    
    const data = await response.json();
    console.log('Benefits found:', data.benefits?.length || 0);
    
    if (data.benefits) {
      data.benefits.forEach(benefit => {
        console.log(`- ${benefit.title} (${benefit.brand.name})`);
      });
    }
    
  } catch (error) {
    console.error('Error testing API:', error.message);
    console.error('Make sure your development server is running on http://localhost:3000');
  }
}

testAPI(); 