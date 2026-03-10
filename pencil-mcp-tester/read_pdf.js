import fs from 'fs';
const run = async () => {
    try {
        const pkg = await import('pdf-parse');
        const pdf = pkg.default || pkg;
        let dataBuffer = fs.readFileSync('/Users/ashj/spicy-scratchpad/doubletype_design_system.pdf');
        const data = await pdf(dataBuffer);
        fs.writeFileSync('pdf_output.txt', data.text);
        console.log("Written to pdf_output.txt");
    } catch (e) {
        console.error(e);
    }
};
run();
