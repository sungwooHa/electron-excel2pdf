class File {
    constructor(path) {
        this.path = path;
        this.name = path.split('\\').pop().split('/').pop();
        this.extension = this.name.split('.').pop();
        this.createdAt = new Date();
    }

    isValid() {
        return this.extension === 'xlsx' || this.extension === 'xls';
    }
}

module.exports = File; 