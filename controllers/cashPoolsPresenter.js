module.exports = function(cashPoolData) {
    
    const _cashPoolData = cashPoolData;
    
    module.showCashPoolsIndex = function(req, res, next) {
        res.render('cashPools/cashPoolsIndex', {
            title: 'Cash Pools Index',
            cashPoolsData: _cashPoolData.getPools(),
            usernames: accountData.getUsernames()
            });
    };

    module.showCashPool = function(req, res, next) {
        if (req.params.id != null) {
            var pool = _cashPoolData.getPool(req.params.id);
        
            if (pool !== undefined) {
                res.render('cashPools/cashPoolsPool', {
                    title: pool.name,
                    sumData: pool.calcSums(),
                    dateString: getCurrentDateString(),
                    pool: pool
                });
            } else {
                res.writeHead(301, {Location: '/cashPools'});
                res.end(); 
            }
        } 
    }
    
    module.setState = function(req, res, next) {
        setPoolState(req.query.state, req.params.id, res);
    }
   
    module.addNewPool = function(req, res, next) {
        //TODO: validation
        //In the case that no participants are selected.
        if (req.body.participants == null) {
                res.status(401);
                res.send("You have to select at least one participant");
                return;
        }
        //In the case that there is only one participant.
        if (typeof req.body.participants == 'string')
            req.body.participants = [req.body.participants];
        
        _cashPoolData.addNewPool(
            req.body.name,
            [req.body.owner],
            req.body.participants,
            req.body.startDate,
            req.body.endDate,
            req.body.enforceTimeBounds == 'on'
        );
        res.writeHead(301, {Location: '/cashPools'});
        res.end();
    }
    
    module.addNewEntryToPool = function(req, res, next) {  
        if (req.params.id != null) {
            var pool = _cashPoolData.getPool(req.params.id);
            
            if (pool === undefined) {
                res.status(404);
                res.send("Pool not found");
                return;
            }
            
            if (pool.status != 'open') {
                res.status(403);
                res.send("The pool is not open");
                return;
            }
            
            var entry = {
                "username" : req.body.username,
                "description" : req.body.description,
                "date" : req.body.date,
                "value" : req.body.value
                }
                
            if (!pool.addNewEntry(entry)) {
                res.status(400);
                res.send("new entry is invalid");
                return;
            }
            
            res.writeHead(301, {Location: '/cashPools/' + req.params.id});
            res.end();
        } 
    }

    function getCurrentDateString() {
        var date = new Date();
        var datestring = ''
        if (date.getDate() < 10)
            datestring += '0';
        datestring += String(date.getDate()) + '.';
        if (date.getMonth() < 9)
            datestring += '0';
        datestring +=  String(date.getMonth() + 1) + '.' + String(date.getFullYear());
        return datestring;
    }
    
    function setPoolState(status, id, res) {
        pool = _cashPoolData.getPool(id);
        if (pool === undefined) {
            res.status(404);
            res.send("Pool not found.");
            return;
        }
        if (!pool.setState(status)) {
            res.status(403);
            res.send("Not a valid status");
            return;
        }
        res.writeHead(301, {Location: '/cashPools'});
        res.end();
    }
    
    return module;
};