# Feminicídio em Foco

Projeto educativo desenvolvido no curso de Pedagogia da Universidade Federal do Rio Grande do Sul, para a disciplina Gênero e Sexualidade. O site reúne informações sobre feminicídios consumados no Rio Grande do Sul, serviços da rede de proteção e conteúdo educativo.

## Dados e fontes

As estatísticas têm como fonte a Secretaria da Segurança Pública do Rio Grande do Sul (SSP-RS) e são apresentadas de forma agregada por município e mês. A série disponível começa em 2020. Em 2026, os dados incluídos abrangem janeiro a outubro; meses sem informação publicada permanecem indisponíveis, sem serem tratados como zero.

O total estadual de 2026 é de 65 casos, incluindo 9 em outubro, conforme a aba Geral da planilha atualizada em 5 de novembro. O detalhamento municipal de outubro é parcial e complementa a base preservada de janeiro a setembro com evidências explícitas; seus totais podem não somar o total estadual.

As referências jornalísticas complementam o conteúdo e direcionam às publicações originais. Elas não estabelecem correspondência individual com os totais da SSP-RS. O mapa apresenta registros municipais e serviços com endereço público; não localiza ocorrências por endereço ou bairro.

Os dados da rede de proteção têm como referência a IEDE/RS, sob licença CC BY-NC 4.0. Os arquivos de dados incluem informações sobre procedência, atualização e limites de cada conjunto.

## Desenvolvimento

Aplicação estática desenvolvida com React, TypeScript, Vite e CSS próprio. O mapa utiliza Leaflet e React Leaflet.

Para iniciar o ambiente local:

```sh
npm ci
npm run dev
```

Para gerar a versão de produção, execute `npm run build`. Os arquivos são gerados em `dist/`.
