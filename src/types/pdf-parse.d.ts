declare module 'pdf-parse' {
  interface PDFParseOptions {
    pagerender?: (pageData: any) => Promise<string>;
    max?: number;
    version?: string;
  }

  interface PDFParseResult {
    numpages: number;
    numrender: number;
    info: any;
    metadata: any;
    text: string;
    version: string;
  }

  function PDFParse(dataBuffer: Buffer, options?: PDFParseOptions): Promise<PDFParseResult>;
  export = PDFParse;
}

// Add declaration for the specific lib path used in the fallback import
declare module 'pdf-parse/lib/pdf-parse.js' {
  import PDFParse from 'pdf-parse';
  export default PDFParse;
}
