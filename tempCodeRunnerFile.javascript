function delay(ms){
    return new Promise(resolve=>setTimeout(resolve,ms))
}
async function getApple(){
    await delay(3000)
    return 'apple';
}
async function getBanana(){
    await delay(3000)
    return 'Banana';
}

async function pickAll(){
    const apple = getApple()
    const banana = getBanana()
    const apple_ = await apple
    const banana_ = await banana
    console.log(apple,banana)
}
pickAll()


