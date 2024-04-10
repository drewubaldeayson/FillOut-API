const express = require('express')
const bodyParser = require('body-parser');
const cors = require('cors');
const axios = require('axios');

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const baseUrl = "https://api.fillout.com";
const apiVersion = "v1";
const getFormAPI = "api/forms";
const bearerToken = "sk_prod_TfMbARhdgues5AuIosvvdAC9WsA5kXiZlW8HZPaRDlIbCpSpLsXBeZO7dCVZQwHAY3P4VSBPiiC33poZ1tdUj2ljOzdTCCOSpUZ_3912";


app.get('/:formId/filteredResponses', (req, res) => {
    const formId = req.params.formId;
    const requests = req.body;

    axios.get(`${baseUrl}/${apiVersion}/${getFormAPI}/${formId}/submissions`, { headers: { 'Authorization': 'Bearer ' + bearerToken } })
        .then(data => {
            let responses = data.data.responses;
            let filteredResponses = {
                "responses": [],
                "totalResponses": 0,
                "pageCount": 0
            };
           

            responses.forEach(element => {
                let questionsList = element.questions;
                let validExpressionCounter = 0;

                requests.forEach(requestElement => {
                    questionsList.forEach(questionElement => {
                        if(questionElement.id == requestElement.id){
                            if(requestElement.condition == "equals"){
                                if(requestElement.value == questionElement.value){
                                    
                                    validExpressionCounter++;
                                }
                            }else if(requestElement.condition == "does_not_equal"){
                                if(requestElement.value != questionElement.value){
                                    validExpressionCounter++;
                                }
                            }else if(requestElement.condition == "greater_than"){
                                if(questionElement.value > requestElement.value ){
                                    validExpressionCounter++;
                                }
                            }else if(requestElement.condition == "less_than"){
                                if(questionElement.value < requestElement.value){
                                    validExpressionCounter++;
                                }
                            }
                        }
                    });
                });

                 if(validExpressionCounter == requests.length){
                    filteredResponses.responses.push(element)
                }
                
            });

            filteredResponses.totalResponses = filteredResponses.responses.length;
            filteredResponses.pageCount = 1;

            res.json(filteredResponses);
        })
        .catch(err => res.json(err));
});

app.listen(port, () => console.log(`App is listening on port ${port}!`));