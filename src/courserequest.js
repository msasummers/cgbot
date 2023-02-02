async function course (c) {
    c = c.replace(' ', '%20');
    const url = 'https://api.cougargrades.io/catalog/getCourseByName?courseName=' + c;

    const rawResponse = await fetch(url, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            },
        body: JSON.stringify({a: 1, b: 'Textual content'})
    });
    try {
    const content = await rawResponse.json();
    console.log(content);
    
    console.log(content.description);
    console.log(content._id);
    console.log(content.GPA.average);
    } catch (e){
        console.log(e);
    }
  };

course('nonsense 3320');