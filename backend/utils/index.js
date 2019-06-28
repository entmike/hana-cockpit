module.exports = (options)=>{
    let opt = options || {};
    let l = [];
    let spam = false || opt.spam;
    return {
        log(msg){
            if(msg===undefined) return l;
            if(spam) console.log(msg);
            l.push(msg);
            return this;
        }
    };
}