
tableEdit = {

    init: function(table) {
        console.log(table)

        table.each(function (index, value) {
                let cols = tableEdit.getColumns($(value));
                console.log(cols)
                $(value).Tabledit({
                    //url: 'example.php,
                    eventType: 'dblclick',
                    editButton: true,
                    deleteButton: true,
                    columns: {
                        identifier: [0, 'id'],
                        editable: cols
                    },
                    buttons: {
                        edit: {
                            class: 'btn btn-sm btn-default',
                            html: '<span class="fas fa-edit fa-2x" style="color:green;"></span>',
                            action: 'edit'
                        },
                        delete: {
                            class: 'btn btn-sm',
                            html: '<span class="fas fa-trash fa-2x" style="color:red;"></span>',
                            action: 'delete'
                        }
                    }
            });
        });
        tableEdit.addTableMgmtButtons(table);
    },

    getColumns: function (table) {
        columns = [];
        table.find('th').each(function (index, value) {
            columns.push([index, $(value).text()]);
        })
        
        return columns;
    },

    addTableMgmtButtons: function (table) {
        table.after(
            '<div class="text-right align-middle"><button class="btn btn-success table-add-row"><span class="far fa-plus-square fa-2x" ></span>' +
            ' <span class="d-inline-block align-top font-weight-bold ml-3 mt-1">Add Row</span></button></div>' +
            '<div class="text-center">' +
            '<button class="btn btn-primary save-table btn-lg">Save table changes</button> <button class="btn btn-warning save-table ml-5 btn-lg">Cancel</button>' +
            '</div >');

        $(document).on('click', '.table-add-row', function (item) {

            let table = $(this).parent().prev();
            newRow = table.find('tr:last').clone();
            newRow.find('th').text('New Row');
            newRow.find('td .tabledit-span').empty();
            newRow.find('td .tabledit-input').val('');
            table.append(newRow);
        })

        $(document).on('click', '.save-table', function (item) {

            let groupCriteria = {}
               
            let table = $(this).parent().prev().prev();

            groupCriteria.id = table.find('thead tr th').data('id') ? table.find('thead tr th').data('id') : 0;
            groupCriteria.id = table.find('thead tr th').data('name') ? table.find('thead tr th').data('name') : 'no name';

            console.log(groupCriteria);
            table.find('tr').each(function (index, row) {

                //$(row).find('td');
                //console.log(value);
            });
            
            //groupCriteria = {

            //} 
            
            //newRow = table.find('tr:last').clone();
            //newRow.find('th').text('New Row');
            //newRow.find('td .tabledit-span').empty();
            //newRow.find('td .tabledit-input').val('');
            //table.append(newRow);
        })
    }
}