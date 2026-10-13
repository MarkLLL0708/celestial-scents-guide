import type {Perfume,Chart} from './types';
const entries: [string,string,string,number,'feminine'|'masculine'|'unisex',string[],string[],string[],string[]][] = [
 ['open-orbit','Open Orbit','Citrus',120,'unisex',['bergamot','lemon'],['neroli','tea'],['cedar','musk'],['curious','bright']],
 ['soft-static','Soft Static','Woody',145,'unisex',['fig','cardamom'],['tea','iris'],['sandalwood','musk'],['soft','calm']],
 ['petal-theory','Petal Theory','Floral',95,'feminine',['pear','bergamot'],['rose','peony'],['musk','cedar'],['clean','soft']],
 ['skin-sentence','Skin Sentence','Musk',85,'unisex',['neroli','pepper'],['iris','jasmine'],['musk','sandalwood'],['intimate','soft']],
 ['green-parenthesis','Green Parenthesis','Green',65,'unisex',['mint','basil'],['fig','tea'],['oakmoss','vetiver'],['curious','green']],
 ['velvet-error','Velvet Error','Oriental',180,'unisex',['cardamom','orange'],['incense','rose'],['amber','vanilla'],['bold','warm']],
 ['salt-index','Salt Index','Fresh',40,'unisex',['salt','lemon'],['neroli','tea'],['musk','cedar'],['clean','bright']],
 ['after-hours','After Hours','Gourmand',110,'feminine',['pear','orange'],['cacao','honey'],['tonka','vanilla'],['warm','intimate']],
 ['herbarium-no-4','Herbarium No. 4','Aromatic',75,'masculine',['lavender','sage'],['basil','tea'],['vetiver','oakmoss'],['calm','green']],
 ['quiet-hide','Quiet Hide','Leather',220,'masculine',['pepper','violet'],['leather','iris'],['cedar','amber'],['bold','grounded']],
 ['white-margin','White Margin','Floral',160,'feminine',['neroli','pear'],['jasmine','rose'],['sandalwood','musk'],['soft','unexpected']],
 ['paper-woods','Paper Woods','Woody',135,'masculine',['bergamot','cardamom'],['cedar','sage'],['vetiver','patchouli'],['grounded','clean']],
];
export const perfumes:Perfume[] = entries.map((p,i)=>({id:p[0],name:p[1],brand:'Atelier Sample',scent_family:p[2],price:p[3],style:p[4],top_notes:p[5],heart_notes:p[6],base_notes:p[7],mood_tags:p[8],currency:'USD',size_ml:i%2?100:50,intensity:i%5+1,sold_out:i===9}));
export const demoChart:Chart={sun:'Aquarius',moon:'Cancer',rising:'Libra',venus:'Pisces',mars:'Gemini',mercury:'Capricorn',elements:{fire:15,earth:20,air:40,water:25}};
export const cities=[{city:'Hanoi',country:'Vietnam'},{city:'Ho Chi Minh City',country:'Vietnam'},{city:'Da Nang',country:'Vietnam'},{city:'Singapore',country:'Singapore'},{city:'Shanghai',country:'China'},{city:'Hong Kong',country:'China'},{city:'Tokyo',country:'Japan'},{city:'Bangkok',country:'Thailand'},{city:'London',country:'United Kingdom'},{city:'New York',country:'United States'}];
