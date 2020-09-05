'use strict';

const request = require('request');
const TMDB = require('../config').TMDB;
const createResponse = require('./createResponse');
const MAX_CONFIDENCE = 0.8;

const extractIntent = (nlp) => {
    let obj = nlp.intents && nlp.intents[0];
    if(obj && obj.confidence > MAX_CONFIDENCE){
        return obj.name;
    } else {
        return null;
    }
}
const extractEntity = (nlp, entity) => {
    let obj = nlp.entities[entity] && nlp.entities[entity][0];
    if(obj && obj.confidence > MAX_CONFIDENCE) {
        return obj.value;
    } else {
        return null;
    }
}

const getMovieData = (movie, releaseYear = null) => {
    let qs = {
        api_key: TMDB,
        query: movie,
        language: "sr-RS",
    }

    if(releaseYear) {                           
        qs.year = Number(releaseYear);
    }

    return new Promise((resolve, reject) => {   
        request({
            uri: 'https://api.themoviedb.org/3/search/movie',
            qs
        }, (error, response, body) => {         
            if(!error && response.statusCode === 200) {
                let data = JSON.parse(body);   
                resolve(data.results[0]);      
            } else {
                reject(error);
            }
        });
    });
}


const getDirector = movie_id => {
    return new Promise((resolve, reject) => {
        request({
            uri: `https://api.themoviedb.org/3/movie/${movie_id}/credits`,
            qs: {
                api_key: TMDB
            }
            //u callback f-ji, parsiram body koji dobijem i pristupam II po redu nizu "crew"
        }, (error, response, body) => {                    
            if(!error && response.statusCode === 200) {
                let result = JSON.parse(body).crew;
                //1 movie can have M directors 
                let directors = result.filter(item => item.job === 'Director').map(item => item.name).join(', ');   
                resolve(directors);                                                                                 
            } else {                                                                                                
                reject(error);                                                                                      
            }                                                                                                      
        });
    });
}

module.exports = nlpData => {
    return new Promise(async function(resolve, reject) {
        let intent = extractIntent(nlpData);
        //resolve(intent);
        
        if(intent) {
            let movie = extractEntity(nlpData, 'movie:movie');
            let releaseYear = extractEntity(nlpData, 'releaseYear:releaseYear');
            // Get data (including id) about the movie
            // Get director(s) using the id
            // Create a response and resolve back to the user
            if(intent ==='greetingUser'){
                resolve({
                    txt: `Zdravo! Ja sam četbot koji ti može dati informacije vezane za željeni film poput:\n-Kada je objavljen Inception?\n-Ko je režirao film Inception?\n-Kratki opis za film Inception`,
                    img: null
                });
            } else if(intent ==='thankYou'){
                resolve({
                    txt: `Nema na čemu! :)`,
                    img: null
                });
            } else if(intent ==='sadMood'){
                resolve({
                    txt: `Nažalost, ja sam samo mali četbot koji ima još mnogo toga da nauči. Trenutno sam sposoban da dam informacije o željenom filmu poput:\n-Kada je objavljen Inception?\n-Ko je rezirao film Inception?\n-Kratki opis za film Inception\n\n Nadam se da ću jednog dana moći da zadovoljim tvoja očekivanja :(`,
                    img: null
                });
            } else if(intent ==='laugh'){
                resolve({
                    txt: `😅`,
                    img: null
                });
            }
            try {
                let movieData = await getMovieData(movie, releaseYear); 
                let director = await getDirector(movieData.id);         
                console.log(movieData);
                //console.log(director);
                //resolve(true);
                let response = createResponse(intent, movieData, director);
                resolve(response);                                                
            } catch(error) {
                reject(error);
            }

        } else {
            resolve({
                txt: "Nisam siguran da Vas razumem!",
                img: null
            });
        }
    });
}


