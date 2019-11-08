
tableEdit = {

    tables: [],
    init: function(tables) {
        
        this.tables = tables;
        tables.each(function (index, value) {
                let cols = tableEdit.getColumns($(value));

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
        tableEdit.addTableMgmtButtons(tables);
    },

    getColumns: function (table) {
        columns = [];
        table.find('th').each(function (index, value) {
            columns.push([index, $(value).text()]);
        })
        
        return columns;
    },

    addTableMgmtButtons: function (table) {

        let self = this;

        table.last().after(
            '<div class="text-center">' +
            '<button class="btn btn-primary save-table btn-lg">Save table changes</button> <button class="btn btn-warning save-table ml-5 btn-lg">Cancel</button>' +
            '</div >');

        table.after(
            '<div class="text-right align-middle"><button class="btn btn-success table-add-row"><span class="far fa-plus-square fa-2x" ></span>' +
            ' <span class="d-inline-block align-top font-weight-bold ml-3 mt-1">Add Row</span></button></div>');

        $(document).on('click', '.table-add-row', function (item) {

            let table = $(this).parent().prev();
            newRow = table.find('tr:last').clone();
            newRow.find('th .tabledit-span').text('New Criteria');
            newRow.find('th .tabledit-input').val('New Criteria');
            newRow.data('id', -1);
            newRow.find('td').data('id',-1);
            newRow.find('td .tabledit-span').empty();
            newRow.find('td .tabledit-input').val('');
            table.append(newRow);
        })

        $(document).on('click', '.save-table', function (item) {
            tableEdit.generateJSON(self.tables)
        })

    },
    generateJSON: function (tables) {
        let template = {};
        template.id = $('.assessment-container').data('id');
        template.name = $('.assessment-container').data('name');
        template.type = 'table';
        template.groupCriteria = [];
        tables.each(function (index, table) {
            template.groupCriteria.push(tableEdit.generateCriteriaGroup($(table)));
        })

        console.log(template);
        return template;
    },

    generateCriteriaGroup: function (table) {

        let groupCriteria = {};

        groupCriteria.id = table.find('thead tr th').data('id') ? table.find('thead tr th').data('id') : 0;
        groupCriteria.name = table.find('thead tr th').data('name') ? table.find('thead tr th').data('name') : 'no name';
        groupCriteria.criteria = [];

        table.find('tbody tr').each(function (index, element) {
            var criteria = {}
            criteria.id = $(element).data('id');
            criteria.name = $(element).data('name');
            criteria.description = '';

            criteria.fields = []
            $(element).find('td[data-score]').each(function (index, td) {
                var field = {};
                field.id = $(td).data('id');
                field.name = $(td).data('name')
                field.value = $(td).data('value')
                field.description = $(td).find('.tabledit-span').text();
                field.points = $(td).data('score')
                criteria.fields.push(field);
            });

            groupCriteria.criteria.push(criteria);
        });
        return groupCriteria;
    }

}