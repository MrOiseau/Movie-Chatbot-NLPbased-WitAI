'use strict';
const convert = require('cyrillic-to-latin');

module.exports = (intent, data, director) => {      
    // Extract movie data using destructuring
    let {
        title,
        overview,
        release_date,
        poster_path
    } = data;

    // Extract release year from "YYYY-MM-DD"
    let releaseYear = release_date.slice(0, 4);

    function replaceLastComma(str){
        let novi ="";
        for (var i = str.length-1; i >= 0; i--){
            if (str.charAt(i) == ","){
                novi = str.substring(0, i) +" i"+str.substring(i+1);
                return novi;
            }
        }
    }

    // Create response based on intent
    if(intent === 'movieInfo') {
        // FB Messenger in 1 message accept max 2000 characters
        // https://developers.facebook.com/docs/messenger-platform/reference/send-api/#message
        if(overview == ""){
            if(director != "undefined" || director == ""){
                return {                                                                    
                    txt: `Hmm... na žalost nemam informacije o filmu ${convert(title)} iz ${releaseYear}.`,
                    img: `https://image.tmdb.org/t/p/w300/${poster_path}`                    
                }  
            } else return {                                                                    
                txt: `Hmm... na žalost nemam informacije o filmu ${convert(title)} iz ${releaseYear}., ali znam da je režiran od strane ${replaceLastComma(director)}-a.`,
                img: `https://image.tmdb.org/t/p/w300/${poster_path}`                    
            }                                                          
        }
        let str = `${convert(title)} (${releaseYear}): ${convert(overview)}`.substring(0, 2000);       
        return {
            // https://developers.themoviedb.org/3/getting-started/images   //w300 - width of image                                                                    
            txt: str,
            img: `https://image.tmdb.org/t/p/w300/${poster_path}`                    
        }                                                                            

    } else if(intent === 'director') {
        if(director.includes(",")){              
            var str = `${convert(title)} (${releaseYear}) su režirali ${replaceLastComma(director)}.`.substring(0, 2000);
        } else 
            var str = `${convert(title)} (${releaseYear}) je režirao ${director}.`.substring(0, 2000);
        return {
            txt: str,
            img: null
        }
    } else if(intent ==='releaseYear') {
        let str = `Film ${convert(title)} je objavljen ${releaseYear}. godine`;
        return {
            txt: str,
            img: null
        }
    } 
}

