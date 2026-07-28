const { execSync } = require('child_process');

try {
  console.log('Ajout des fichiers...');
  execSync('git add .', { stdio: 'inherit' });
  
  console.log('\nCreation du commit...');
  try {
    execSync('git commit -m "fix(stripe): correction de l\'export webhook et UI invitation"', { stdio: 'inherit' });
  } catch (e) {
    console.log('Aucun changement a commit ou erreur de commit.');
  }
  
  console.log('\nEnvoi vers GitHub (Push)...');
  execSync('git push', { stdio: 'inherit' });
  
  console.log('\n✅ SUCCES ! Vercel va maintenant commencer le vrai deploiement.');
} catch (error) {
  console.error('\n❌ ERREUR LORS DU PUSH:', error.message);
}
