

/**
 * 
 * @param {*} data 
 * {id: str, user: str, script: str, info: str}
 */


const consoleLoging = async (data) => {
    const currentTime = new Date()
    console.log(`
        $ ID: ${data.id ? data.id : 'No Id Given'}
        # USER: ${data.user ? data.user : "No User Given"}
        ⏱ TIME: ${currentTime}
        * SCRIPT: ${data.script ? data.script : "No Script Info Given"}
        X INFO: ${data.info ? data.info : "No Info Provided"}
    
    `) 
}


module.exports =  consoleLoging 