const { createClient } = require("@supabase/supabase-js");
const supabase = createClient(process.env.URL, process.env.KEY);

(async () => {
  try {

    let { data, error} = await supabase
    .from('users')
    .select('cpf')
    //.eq('valid', true)
    .match({ valid: true, areas: 50 })  
    .is('psc_accounts', null); 

    if (error) {
      console.error('Erro ao buscar dados do Supabase:', error);
      return;
    }

    for (const user of data) {
      const cpf = user.cpf;

      const response = await fetch('https://cloud.certillion.com/css/restful/application/oauth/find-psc-accounts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          "client_id": "20251527000104",
          "client_secret": "6EPVGp7MzJEHf46PMCmEgt1UDTMFAnBaZy9yDnejg",
          "user_cpf_cnpj": "CPF",
          "val_cpf_cnpj": cpf
        })
      });

      let json = await response.json();

      await supabase
        .from('users')
        .update({ psc_accounts: json })
        .match({ cpf: cpf, valid: true });
        
    }

    console.log('Processamento concluído com sucesso!');

  } catch (error) {
    console.error('Erro na requisição:', error);
  }
})();