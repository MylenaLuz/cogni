# APÊNDICE D – TERMO DE USO E POLÍTICA DE PRIVACIDADE DO COGNI {.unnumbered .apendice}

Texto integral exibido no sistema (tela "Termo de uso e privacidade"), versão 2026-11.2, vigente desde 23 de novembro de 2026. O texto é mantido em um único arquivo do código-fonte (`src/legal/termo.json`), do qual são gerados tanto a tela do sistema quanto este apêndice.

**Em resumo**

- O Cogni ajuda você, cuidador, a acompanhar o desempenho de uma pessoa em jogos de estimulação cognitiva, sempre em comparação com o padrão dela mesma.
- O Cogni não faz diagnóstico, não substitui avaliação profissional e não deve ser usado em situações de urgência.
- Os dados de saúde só são usados para esse acompanhamento e só são vistos por quem você convidar, conforme o papel que você der. Não vendemos dados, não exibimos anúncios e não usamos os dados para treinar modelos de inteligência artificial.
- Você pode exportar todos os dados ou excluir a conta a qualquer momento, em Minha conta.

**1. Quem somos e a quem este termo se aplica**

O Cogni é um sistema desenvolvido como Trabalho de Conclusão de Curso de Engenharia de Software da UniCesumar, em Curitiba, pela equipe formada por Kimberly Valle, Lucas Matheus Vaz e Mylena Alves. A equipe é a controladora dos dados tratados pelo sistema, nos termos da Lei Geral de Proteção de Dados Pessoais (Lei nº 13.709/2018, LGPD).

Este termo se aplica a quem cria uma conta no Cogni (o cuidador) e às pessoas cadastradas por ele para acompanhamento (as pessoas acompanhadas).

Encarregado pelo tratamento de dados: a ser designado pela equipe antes de qualquer uso com pessoas reais. Até lá, o sistema é usado apenas com dados fictícios de demonstração.


**2. O que o Cogni é e o que não é**

O Cogni oferece jogos de estimulação cognitiva e mostra ao cuidador como o desempenho da pessoa acompanhada se compara com o padrão dela mesma ao longo do tempo.

O Cogni não é um dispositivo médico, não faz diagnóstico, não indica tratamento e não substitui a avaliação de profissionais de saúde. Os avisos exibidos são informativos: indicam mudanças em relação ao padrão da própria pessoa e sugerem, quando for o caso, conversar com a equipe de saúde.

Em caso de urgência, procure atendimento médico ou ligue para o SAMU (192).


**3. Quem pode usar**

A conta é pessoal e destinada a maiores de 18 anos.

Ao cadastrar uma pessoa para acompanhamento, você declara ser responsável legal por ela ou ter a autorização dela, ou de quem a represente legalmente, para registrar os dados e realizar as atividades. Cadastre apenas pessoas com quem você tenha esse vínculo.

Quem cadastra uma pessoa se torna o responsável por ela e pode convidar outros cuidadores por um código, com um de três papéis: responsável (edita o cadastro e convida), cuidador (joga, registra observações e vê tudo) ou acompanhante (só visualiza). Numa instituição, o gestor vê e administra todas as pessoas da instituição e a equipe; cada profissional vê apenas as pessoas a que o gestor o atribuiu.


**4. Quais dados tratamos**

Dados do cuidador: nome, e-mail, telefone, tipo de vínculo (familiar, cuidador profissional ou instituição) e, quando houver, a instituição de que participa e o papel nela. A senha nunca é armazenada: guardamos apenas um resumo criptográfico (hash) dela.

Dados da pessoa acompanhada: nome, data de nascimento, condição informada por você, familiaridade com tecnologia e observações gerais. Somente o nome é obrigatório.

Dados das sessões de jogo: jogo, nível, data e duração; cada evento da partida (estímulo exibido, toque, acerto, erro, omissão e tempo de reação em milissegundos); a pontuação calculada; as observações que você escrever; o tamanho da tela e a hora local da sessão.

Dados técnicos e de segurança: registro de cada leitura, alteração, inserção, arquivamento e exportação de dados de uma pessoa acompanhada (quem, o quê e quando); registro do seu aceite deste termo, com a versão e a data; quem acompanha cada pessoa e com que papel; os convites gerados e usados; e registros técnicos do servidor, como endereço IP e horário das requisições.

Os dados de saúde da pessoa acompanhada, incluindo a condição informada e o desempenho nos jogos, são dados pessoais sensíveis (LGPD, art. 5º, II) e recebem a proteção descrita neste termo.


**5. Para que usamos os dados**

Usamos os dados para: criar e manter sua conta e sua sessão de acesso; registrar as sessões de jogo; calcular as pontuações e comparar cada sessão com o padrão da própria pessoa; exibir o painel, os relatórios e as análises; enviar o e-mail de recuperação de senha quando você pedir; e proteger o sistema contra acessos indevidos.

Não vendemos nem alugamos dados. Não exibimos publicidade. Não usamos os dados para treinar modelos de inteligência artificial. Os avisos são gerados por regras estatísticas documentadas e não produzem decisões que afetem direitos da pessoa acompanhada.


**6. Bases legais**

Dados de saúde da pessoa acompanhada: consentimento específico e destacado, dado no momento do cadastro (LGPD, art. 11, I).

Dados do cuidador necessários para a conta: execução do serviço que você solicitou (LGPD, art. 7º, V) e seu consentimento (art. 7º, I).

Registros de segurança: legítimo interesse em proteger as contas e os dados contra acessos indevidos (LGPD, art. 7º, IX), sem uso desses registros para outra finalidade.


**7. Com quem os dados podem ser compartilhados**

Dentro do Cogni, os dados de uma pessoa acompanhada são vistos por quem a acompanha: o responsável, os cuidadores e acompanhantes que ele convidar e, se a pessoa pertencer a uma instituição, o gestor e os profissionais atribuídos. Cada um vê o nome e o papel dos demais. Numa instituição, o gestor vê também o nome e o e-mail dos membros da equipe. Convide apenas pessoas de confiança; o responsável pode remover um convidado a qualquer momento.

Os dados não são compartilhados com terceiros para finalidades próprias deles. Podem ter acesso aos dados, apenas na medida necessária: os provedores que operam a infraestrutura do sistema, como hospedagem e envio de e-mail, que atuam como operadores e seguem nossas instruções; e autoridades públicas, quando houver obrigação legal ou ordem judicial.

Se a hospedagem estiver fora do Brasil, a transferência internacional seguirá as garantias exigidas pelo art. 33 da LGPD.

O sistema não carrega fontes, imagens, ferramentas de análise ou anúncios de outros sites. Nenhum dado é enviado a terceiros pelo seu navegador.


**8. Como protegemos os dados**

Senhas protegidas com o algoritmo Argon2id; conexão sempre por HTTPS; sessão de acesso com validade de 15 minutos, renovada por um cookie protegido contra leitura por scripts; bloqueio temporário após tentativas seguidas de login com senha errada; cada cuidador acessa apenas as pessoas a que está vinculado; e registro de todos os acessos aos dados das pessoas acompanhadas.

Nenhuma medida elimina todos os riscos. Se ocorrer um incidente de segurança que possa causar risco ou dano relevante, você e a Autoridade Nacional de Proteção de Dados (ANPD) serão comunicados, conforme o art. 48 da LGPD.


**9. Por quanto tempo guardamos os dados**

Os dados são mantidos enquanto sua conta estiver ativa.

Quando você exclui a conta, são apagados imediatamente: seus dados de cuidador, seus vínculos e as pessoas acompanhadas que não tenham outro cuidador vinculado, com todas as sessões e eventos delas. Se outra pessoa também acompanha alguém de quem você era o único responsável, ela passa a ser a responsável. As cópias de segurança do banco são substituídas diariamente e guardam no máximo os últimos 7 dias; depois disso, os dados excluídos deixam de existir também nelas.

Os registros de acesso são mantidos sem a identificação do cuidador e da pessoa depois da exclusão, apenas para fins de segurança e auditoria.


**10. Seus direitos e como exercê-los**

A LGPD (art. 18) garante a você, e à pessoa acompanhada por meio do responsável, os direitos de: confirmar se há tratamento de dados; acessar os dados; corrigir dados incompletos, inexatos ou desatualizados; obter a anonimização, o bloqueio ou a eliminação de dados desnecessários; receber os dados em formato que permita levá-los a outro serviço (portabilidade); saber com quem os dados foram compartilhados; e revogar o consentimento.

No próprio sistema, em Minha conta, você pode exportar todos os dados da conta, incluindo os eventos de cada sessão, em arquivo JSON, e excluir a conta. Em Relatórios, pode exportar as sessões de cada pessoa em arquivo CSV.

Revogar o consentimento equivale a excluir a conta, porque os dados de saúde são a base do serviço. Os demais pedidos podem ser feitos ao encarregado (seção 1). Você também pode apresentar reclamação à ANPD.


**11. Cookies e armazenamento no navegador**

O Cogni usa um único cookie, essencial para manter você conectado com segurança. Ele não serve para rastreamento nem publicidade.

O navegador também guarda qual pessoa acompanhada você escolheu por último, para facilitar o início da próxima sessão. Essa informação fica apenas no seu aparelho.


**12. Suas responsabilidades**

Manter sua senha em sigilo e não compartilhar a conta; informar dados verdadeiros; cadastrar apenas pessoas com quem você tenha o vínculo descrito na seção 3; compartilhar códigos de convite apenas com quem deve acompanhar a pessoa, e remover quem não deve mais ter acesso; e não usar os resultados do Cogni como diagnóstico ou para decidir tratamentos sem orientação profissional.


**13. Disponibilidade e responsabilidade**

O Cogni é um projeto acadêmico e é oferecido sem garantia de funcionamento contínuo. Pode haver interrupções para manutenção ou por falhas. Recomendamos exportar seus dados periodicamente.

Os resultados exibidos dependem do uso regular e de fatores que o sistema não controla, como sono, visão, humor e familiaridade com o aparelho. Por isso não devem ser interpretados isoladamente.


**14. Alterações deste termo**

A versão aceita por você fica registrada com data. Se este termo mudar de forma relevante, você será avisado dentro do sistema e um novo aceite será solicitado antes de continuar o uso.


**15. Legislação aplicável**

Este termo é regido pelas leis brasileiras, em especial a LGPD e o Código de Defesa do Consumidor.
