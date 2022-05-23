/************ 
 * desc : A command line app, provides helper file to translate json files
 * using .mjs extenstion to support es6 imports
 * author : jeff
*/
'use strict'
/// imports 
import fs from 'fs';
import fsProm from 'fs/promises'
import { argv } from 'process';

// user arguments 
const action = argv[2];
const filePath = argv[3];
const valuesPath = argv[4];
const newFileName = argv[5];

// user options supported in command line
const userOptions = { genArray : 'GA', assignValues : 'AS',help : '--HELP'};

// help text 
const help = `> this is a command line app
  user has to provide required arguments to run this app
  1st action to be performed : GA(generate array from json values) , AS(generate a new file by assinging new values)
  2nd arg is path of the source json file 
  3rd arg is path to the source values
  4th arg is the name of the file produced by the app
note : if no file name is given for c, file is created with default names(values.json,final.json)
       can use '-' fields which user don't want to mention `;


// utility function to read json file and get its values
const getValues = async function(destPath,writePath = 'values.json'){
    try{
        const data = await fsProm.readFile(destPath);
        const words = JSON.parse(data);
        const values = Object.values(words);
        const res = await fsProm.writeFile(writePath,JSON.stringify(values,null,3));
        return writePath;
    }
    catch(err){
        console.log(err);
    }
}
// gets an object and an array where all of irs properties will be assigned with the new array values
const assignValues = async function(initialObjPath,translatedValsPath){
    try {
        const initialObjJson = await fsProm.readFile(initialObjPath);
        const translatedValsJson = await fsProm.readFile(translatedValsPath);

        const initialObj = JSON.parse(initialObjJson);
        const translatedVals = JSON.parse(translatedValsJson);

        if (Object.keys(initialObj).length !== translatedVals.length){
            console.log(initialObj.length);
            console.log(translatedVals.length);
            throw new Error ('object and array are not in same size,might get mismatched results');
        }
        const translated = {};
        let arrCounter = 0
        // loops through object's porperties and assigns values to object with translated values 
        for (let prop in initialObj) {
            translated[prop] = translatedVals[arrCounter++];
        }
        const res = await fsProm.writeFile( (newFileName || 'final.json'),JSON.stringify(translated,null,3));
        return res;
    } catch (error) {
        console.log(error);
    }
}

// acting according to user commandline arguments
if (action){
    switch(action.toUpperCase()){
        case userOptions.genArray:
            getValues(filePath,newFileName)
            .then(res => {
                console.log(`> Values are generated in path : ${res}`);
                console.log('> Format the generated json file and translate it in google translate');
            })
            .catch(err => {if (err) throw err });
            break;
        case userOptions.assignValues:
            assignValues(filePath,valuesPath)
            .then(val => console.log('file created :-)'))
            .catch(err => {throw err});
            break;
        case userOptions.help:
            console.log(help);
            break;
        case '-':
            console.log('action is a mandatory argument');
        default :
            console.log('> Unkonw action \n!!! something went wrong'); 
            break;     
    }
}
else{
    console.log('> looks like you haven\'t entered any arguments')
    console.log(`> use --help for breif`);
}