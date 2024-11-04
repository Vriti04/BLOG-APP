const fs = require('fs');

const readUser = ()=>{
    if(!fs.existsSync("./user.json")){
        fs.writeFileSync("./user.json",JSON.stringify([]));
    }

    const data = fs.readFileSync("./user.json", 'utf-8');
    if(data.trim()===""){
        return [];
    }
    return JSON.parse(data, 'utf-8');
}

const writeUser = (data)=>{
    fs.writeFileSync("./user.json", JSON.stringify(data,null,2), 'utf-8');
}

module.exports={
    readUser,writeUser
};