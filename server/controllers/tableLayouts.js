const TableLayout = require('./TableLayout');
import * as res from 'express/lib/response';

const postTableLayout = (req, res) => {
    const tableLayout = new TableLayout(req.body);

    tableLayout.save()
        .then((result) => {
            res.send(result);
        })
        .catch((err) => {
            console.log(err);
        });
}

const getTableLayout = (req,res) => {
    const id = req.body.id;
    TableLayout.findById(id)
        .then((result) => {
            res.send(result);
        })
        .catch((err) => {
            console.log(err);
        });
}