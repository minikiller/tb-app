const axios = require('axios')

const HOST_IP = "http://1XXXX:8080/";
const AUTH_ADDRESS = HOST_IP + "api/auth/login";
//111
// const DEVICE_ID = "b3bcb810-56cf-11ea-9eca-97bfcfb9f3d0";
//112
// const DEVICE_ID = "b93fda10-56cf-11ea-9eca-97bfcfb9f3d0";
//113
// const DEVICE_ID = "bf2d0880-56cf-11ea-9eca-97bfcfb9f3d0";
//114
const DEVICE_ID = "c62a6e70-56cf-11ea-9eca-97bfcfb9f3d0";
//setting
// const DEVICE_ID = "fe3d1840-5aa2-11ea-b86d-79a79971f7b7";

const auth_data = {"username":"guolu@kalix.com", "password":"123456"};
const shared_attribute = {
    "P_Range": 32,
    "T_Range": 500,
    "KP_Range": 500,
    "WP_Range": 500,
    "In_Dia": 51,
    "a_Kb": 0.67133,
    "a_Wg": 1.01334,
    "d_Kb": 34.68,
    "d_Wg": 28.56,
    "No_Pipe": "111注汽管网"
};

// "P_Range":"压力量程0",
 
// 	 "T_Range":"温度量程0",
 
// 	 "KP_Range":"孔板差压量程0",
  
// 	"WP_Range":"文管差压量程0",
  
// 	"In_Dia":"管道内径0",
 
// 	 "a_Kb":"孔板系数0",
 
// 	 "a_Wg":"文管系数0",
  
// 	"d_Kb":"孔板喉径0",
 
// 	 "d_Wg":"文管喉径0",
 
// 	 "No_Pipe":"管线号0"
  

// const shared_attribute = {
//     "Location":"52-14井口",
//  	"Fluid":"湿蒸汽",
//  	"Interval":1,
// 	 "SampleNum":256,
//  	"Threshold":25
// };

const shared_address = HOST_IP + "api/plugins/telemetry/DEVICE/" + DEVICE_ID + "/SHARED_SCOPE";

axios.post(AUTH_ADDRESS, auth_data
    , {
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        }
    })
    .then((res) => {
        const data = res.data;
        console.log(`statusCode: ${res.statusCode}`)
        console.log(data)
        post_shared_data(data.token);
    })
    .catch((error) => {
        console.error(error)
    })

function post_shared_data(token) {
    const Headers = {
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'x-authorization': 'Bearer ' + token
        }
    };
    axios.post(shared_address, shared_attribute, Headers)
        .then((res) => {
            console.log(`statusCode: ${res.status} device is ${DEVICE_ID}`)
        })
        .catch((error) => {
            console.error(error)
        })

}
